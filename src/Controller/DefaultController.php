<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;
use Twig\Environment; // Don't forget to import the Twig\Environment class.

class DefaultController extends AbstractController
{
    private $loader;

    public function __construct(Environment $twig)
    {
        $this->loader = $twig->getLoader();
    }

    #[Route('/', name: 'home')]
    public function index(): Response
    {
        return $this->render('index.html.twig');
    }

    #[Route('/api/weather', name: 'api_weather', methods: ['POST'])]
    public function weather(): JsonResponse
    {
        $data = json_decode($this->getRequestContent(), true);
        $region = $data['region'] ?? null;
        if (!$region) {
            return $this->json(['error' => 'Region is required.'], 400);
        }
        $url = "https://wttr.in/" . urlencode($region) . "?format=j1";
        $response = @file_get_contents($url);
        if ($response === false) {
            return $this->json(['error' => 'Weather API error.'], 500);
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
    }

    #[Route('/api/plant', name: 'api_plant', methods: ['POST'])]
    public function plant(\Symfony\Component\HttpFoundation\Request $request): JsonResponse
    {
        $plantnetApiKey = $_ENV['PLANTNET_API_KEY'] ?? 'YOUR_PLANTNET_API_KEY';
        $groqApiKey = $_ENV['GROQ_API_KEY'] ?? 'YOUR_GROQ_API_KEY';
        $file = $request->files->get('image');
        if (!$file) {
            return $this->json(['error' => 'Image is required.'], 400);
        }

        // 1. Identify plant with Pl@ntNet
        $ch = curl_init("https://my-api.plantnet.org/v2/identify/all?api-key=$plantnetApiKey");
        $cfile = new \CURLFile($file->getPathname(), $file->getMimeType(), $file->getClientOriginalName());
        $post = ['images' => $cfile, 'organs' => 'auto'];
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
        $result = curl_exec($ch);
        curl_close($ch);
        $data = json_decode($result, true);

        if (!isset($data['results'][0])) {
            return $this->json(['error' => 'Could not identify plant.'], 500);
        }

        $plant = $data['results'][0]['species']['scientificNameWithoutAuthor'] ?? 'Unknown';
        $score = $data['results'][0]['score'] ?? 0;
        $commonName = $data['results'][0]['species']['commonNames'][0] ?? '';

        // 2. Ask Groq for disease diagnosis and advice
        $imageBase64 = base64_encode(file_get_contents($file->getPathname()));
        $prompt = "This is a photo of a plant identified as '$plant' ($commonName). Based on the image (base64-encoded below), what disease or problem might this plant have? Give a diagnosis and practical advice for the farmer. If the plant looks healthy, say so. (Image base64: $imageBase64)";

        $groqPayload = [
            'model' => 'llama3-70b-8192',
            'messages' => [
                ['role' => 'system', 'content' => 'You are an expert plant pathologist and farming assistant.'],
                ['role' => 'user', 'content' => $prompt]
            ],
            'max_tokens' => 300,
            'temperature' => 0.7,
        ];

        $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json",
            "Authorization: Bearer $groqApiKey"
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($groqPayload));
        $groqResult = curl_exec($ch);
        curl_close($ch);

        $groqData = json_decode($groqResult, true);
        $diagnosis = $groqData['choices'][0]['message']['content'] ?? 'No diagnosis available.';

        return $this->json([
            'plant' => $plant,
            'confidence' => $score,
            'common_name' => $commonName,
            'diagnosis' => $diagnosis
        ]);
    }

    #[Route('/api/empathy', name: 'api_empathy', methods: ['POST'])]
    public function empathy(): JsonResponse
    {
        $apiKey = $_ENV['GROQ_API_KEY'] ?? 'YOUR_GROQ_API_KEY';
        $data = json_decode($this->getRequestContent(), true);
        $message = $data['message'] ?? '';
        $payload = [
            'model' => 'llama3-70b-8192',
            'messages' => [
                ['role' => 'system', 'content' => 'You are an empathetic farming assistant. Respond with understanding and helpfulness.'],
                ['role' => 'user', 'content' => $message]
            ],
            'max_tokens' => 150,
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
        if (isset($data['choices'][0]['message']['content'])) {
            return $this->json([
                'empathetic_response' => $data['choices'][0]['message']['content']
            ]);
        } else {
            return $this->json(['error' => 'Groq API error.'], 500);
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
