<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;
use Twig\Environment; // Don't forget to import the Twig\Environment class.
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\ChatMessage;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class DefaultController extends AbstractController
{
    private $loader;
    private EntityManagerInterface $em;
    private $httpClient;

    public function __construct(Environment $twig, EntityManagerInterface $em, HttpClientInterface $httpClient)
    {
        $this->loader = $twig->getLoader();
        $this->em = $em;
        $this->httpClient = $httpClient;
    }

    #[Route('/', name: 'home')]
    public function index(): Response
    {
        return $this->render('index.html.twig');
    }

    #[Route('/api/weather', name: 'api_weather', methods: ['POST'])]
    public function weather(): JsonResponse
    {
        try {
            $data = json_decode($this->getRequestContent(), true);
            $region = $data['region'] ?? null;
            if (!$region) {
                return $this->json(['error' => 'Region is required.'], 400);
            }
            $url = "https://wttr.in/" . urlencode($region) . "?format=j1";
            $response = @file_get_contents($url);
            if ($response === false) {
                throw new \Exception('Weather API error.');
            }
            $weatherData = json_decode($response, true);
            if (!isset($weatherData['current_condition'][0])) {
                return $this->json(['error' => 'Weather not found.'], 404);
            }
            $current = $weatherData['current_condition'][0];
            return $this->json([
                'region' => $region,
                'weather' => $current['weatherDesc'][0]['value'] ?? '',
                'temperature' => $current['temp_C'] ?? '',
                'humidity' => $current['humidity'] ?? '',
                'description' => $current['weatherDesc'][0]['value'] ?? '',
            ]);
        } catch (\Exception $e) {
            error_log('Weather API error: ' . $e->getMessage());
            return $this->json(['error' => 'Could not fetch weather. Please try again later.'], 500);
        }
    }

    #[Route('/api/plant', name: 'api_plant', methods: ['POST'])]
    public function plant(\Symfony\Component\HttpFoundation\Request $request): JsonResponse
    {
        try {
            $file = $request->files->get('image');
            if (!$file) {
                return $this->json(['error' => 'No image uploaded.'], 400);
            }
            $supported = ['image/jpeg', 'image/png'];
            $mimeType = $file->getMimeType();
            if (!in_array($mimeType, $supported)) {
                return $this->json([
                    'error' => 'Unsupported image format. Please upload a JPEG or PNG image.'
                ], 400);
            }
            $srcPath = $file->getPathname();
            $response = $this->httpClient->request('POST', 'http://127.0.0.1:5000/analyze', [
                'body' => [
                    'file' => fopen($srcPath, 'r')
                ]
            ]);
            $data = $response->toArray();
            return $this->json($data);
        } catch (\Exception $e) {
            error_log('Plant API error: ' . $e->getMessage());
            return $this->json([
                'error' => 'Failed to analyze image. Please try again later.'
            ], 500);
        }
    }

    #[Route('/api/empathy', name: 'api_empathy', methods: ['POST'])]
    public function empathy(): JsonResponse
    {
        try {
            $apiKey = $_ENV['GROQ_API_KEY'] ?? 'YOUR_GROQ_API_KEY';
            $data = json_decode($this->getRequestContent(), true);
            $history = $data['history'] ?? null;
            if (!$history || !is_array($history) || count($history) === 0) {
                $message = $data['message'] ?? '';
                $history = [
                    ['role' => 'system', 'content' => 'You are an empathetic farming assistant. Reply in short, clear sentences. Give practical, step-by-step solutions. Be friendly and concise.'],
                    ['role' => 'user', 'content' => $message]
                ];
            }
            $payload = [
                'model' => 'llama3-70b-8192',
                'messages' => $history,
                'max_tokens' => 200,
                'temperature' => 0.7,
            ];
            $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Content-Type: application/json",
                "Authorization: Bearer $apiKey"
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            $result = curl_exec($ch);
            curl_close($ch);
            $data = json_decode($result, true);
            $aiResponse = $data['choices'][0]['message']['content'] ?? null;
            // Save user and AI messages to DB
            if ($history && count($history) > 1) {
                $userMsg = new ChatMessage();
                $userMsg->setRole('user');
                $userMsg->setContent($history[count($history)-1]['content'] ?? '');
                $userMsg->setCreatedAt(new \DateTimeImmutable());
                $this->em->persist($userMsg);
            }
            if ($aiResponse) {
                $aiMsg = new ChatMessage();
                $aiMsg->setRole('assistant');
                $aiMsg->setContent($aiResponse);
                $aiMsg->setCreatedAt(new \DateTimeImmutable());
                $this->em->persist($aiMsg);
            }
            $this->em->flush();
            if ($aiResponse) {
                return $this->json([
                    'empathetic_response' => $aiResponse
                ]);
            } else {
                throw new \Exception('Groq API error.');
            }
        } catch (\Exception $e) {
            error_log('Empathy API error: ' . $e->getMessage());
            return $this->json(['error' => 'AI agent is currently unavailable. Please try again later.'], 500);
        }
    }

    #[Route('/api/analytics', name: 'api_analytics', methods: ['POST'])]
    public function analytics(): JsonResponse
    {
        $data = json_decode($this->getRequestContent(), true);
        file_put_contents(__DIR__ . '/../../var/analytics.log', json_encode($data) . PHP_EOL, FILE_APPEND);
        return $this->json(['status' => 'ok']);
    }

    // Fallback route LAST!
    #[Route('/{path}', requirements: ['path' => '.+'])]
    public function root(string $path): Response
    {
        if ($this->loader->exists($path.'.html.twig')) {
            if ($path == '/' || $path == 'home' || $path == 'index') {
                return $this->render('index.html.twig');
            }
            return $this->render($path.'.html.twig');
        }
        throw $this->createNotFoundException();
    }

    private function getRequestContent(): string
    {
        return file_get_contents('php://input');
    }
}
