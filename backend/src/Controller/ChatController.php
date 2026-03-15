<?php

namespace App\Controller;

use App\N8N\Webhook\WebhookPusher;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ChatController extends AbstractController
{
    public function __construct(private readonly WebhookPusher $webhookPusher)
    {
    }

    #[Route('/api/chat', name: 'api_chat', methods: ['POST'])]
    public function chat(Request $request, HttpClientInterface $httpClient): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $question = $data['question'] ?? null;
        $sessionId = $data['sessionId'] ?? uniqid('session_');

        if (!$question) {
            return $this->json(['error' => 'La question ne peut pas être vide.'], 400);
        }

        try {
            $responseArray = $this->webhookPusher->pushTextRequest($question, $sessionId);
            return $this->json($responseArray);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Désolé, mon clone virtuel est indisponible pour le moment.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
