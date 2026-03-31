<?php

namespace App\Webhook;

interface QuestionPusherInterface
{
    public function pushTextRequest(array $chatRequest, string $sessionId, bool $transcribed): array;
}
