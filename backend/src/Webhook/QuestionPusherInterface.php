<?php

namespace App\Webhook;

use Symfony\Component\HttpFoundation\File\UploadedFile;

interface QuestionPusherInterface
{
    public function pushTextRequest(array $chatRequest, string $sessionId): array;

    public function pushVoiceRequest(UploadedFile $audioFile, string $sessionId): array;
}
