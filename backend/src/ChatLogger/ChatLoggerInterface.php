<?php

namespace App\ChatLogger;

interface ChatLoggerInterface
{
    public function log(string $sender, string $message, string $sessionUuid): void;
}
