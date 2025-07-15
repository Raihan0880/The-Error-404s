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

    #[Route('/api/weather', name: 'api_weather', methods: ['POST'])]
    public function weather(): JsonResponse
    {
        // Placeholder for OpenWeatherMap API key
        $apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
        $data = json_decode($this->getRequestContent(), true);
        $region = $data['region'] ?? null;
        if (!$region) {
            return $this->json(['error' => 'Region is required.'], 400);
        }
        // TODO: Call real weather API
        // Return mock data for now
        return $this->json([
            'region' => $region,
            'weather' => 'Sunny',
            'temperature' => 32,
            'humidity' => 60,
            'description' => 'Clear sky',
        ]);
    }

    #[Route('/api/plant', name: 'api_plant', methods: ['POST'])]
    public function plant(): JsonResponse
    {
        // Placeholder for Plant.id API key
        $apiKey = 'YOUR_PLANTID_API_KEY';
        // TODO: Handle image upload and call Plant.id API
        // Return mock data for now
        return $this->json([
            'plant' => 'Tomato',
            'confidence' => 0.95,
            'advice' => 'Water regularly and provide full sunlight.'
        ]);
    }

    #[Route('/api/empathy', name: 'api_empathy', methods: ['POST'])]
    public function empathy(): JsonResponse
    {
        // Placeholder for Empathy API key
        $apiKey = 'YOUR_EMPATHY_API_KEY';
        $data = json_decode($this->getRequestContent(), true);
        $message = $data['message'] ?? '';
        // TODO: Call real Empathy API
        // Return mock data for now
        return $this->json([
            'empathetic_response' => 'I understand how you feel. Let me help you with your plant!'
        ]);
    }

    #[Route('/api/analytics', name: 'api_analytics', methods: ['POST'])]
    public function analytics(): JsonResponse
    {
        // Placeholder for Supabase API key
        $apiKey = 'YOUR_SUPABASE_API_KEY';
        $data = json_decode($this->getRequestContent(), true);
        // TODO: Send analytics data to Supabase
        // Return mock data for now
        return $this->json(['status' => 'ok']);
    }

    private function getRequestContent(): string
    {
        return file_get_contents('php://input');
    }
}
