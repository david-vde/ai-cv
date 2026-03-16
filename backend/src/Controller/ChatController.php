<?php

namespace App\Controller;

use App\Webhook\QuestionPusherInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[AsController]
readonly class ChatController
{
    public function __construct(private QuestionPusherInterface $webhookPusher)
    {
    }

    #[Route('/api/chat', name: 'api_chat', methods: ['POST'])]
    public function chat(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $question = $data['question'] ?? null;
        $sessionId = $data['sessionId'] ?? uniqid('session_');

        if (!$question) {
            return new JsonResponse(['error' => 'Empty question is not allowed.'], 400);
        }

        try {
            $responseArray = $this->webhookPusher->pushTextRequest($question, $sessionId);
            return new JsonResponse($responseArray);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Unable to contact AI agent.'
            ], 500);
        }
    }
}
