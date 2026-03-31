<?php

namespace App\Controller;

use App\ChatLogger\ChatLoggerInterface;
use App\Webhook\QuestionPusherInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[AsController]
readonly class ChatController
{
    public function __construct(private QuestionPusherInterface $webhookPusher, private ChatLoggerInterface $chatLogger)
    {
    }

    #[Route('/api/chat', name: 'api_chat', methods: ['POST'])]
    public function chat(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $question = $data['question'] ?? null;
        $sessionId = $data['sessionId'] ?? uniqid('session_');
        $transcribed = (bool)($data['transcribed'] ?? false);

        if (!$question) {
            return new JsonResponse(['error' => 'Empty question is not allowed.'], 400);
        }

        try {
            $responseArray = $this->webhookPusher->pushTextRequest($question, $sessionId, $transcribed);
            return new JsonResponse($responseArray);
        } catch (\Exception $e) {
            return new JsonResponse(json_encode([
                'error' => 'Unable to contact AI agent.'
            ]), 500, [], true);
        }
    }

    #[Route('/api/chat-history/{sessionId}', name: 'api_chat_history', methods: ['GET'])]
    public function getChatHistory(SerializerInterface $serializer, string $sessionId): JsonResponse
    {
        try {
            $chatLogs = $this->chatLogger->history($sessionId);

            $json = $serializer->serialize(
                $chatLogs,
                'json',
                ['groups' => 'chatlog:public']
            );

            return new JsonResponse($json, 200, [], true);
        } catch (\Exception) {
            return new JsonResponse([
                'error' => 'Unable to retrieve history.'
            ], 500, []);
        }
    }
}
