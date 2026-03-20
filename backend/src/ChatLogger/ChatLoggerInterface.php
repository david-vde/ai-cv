<?php

namespace App\ChatLogger;

interface ChatLoggerInterface
{
    public function log(
        string $sender,
        string $message,
        string $sessionUuid,
        ChatLogStatus $status =
        ChatLogStatus::SUCCESS,
        string $error = null): void;
}
