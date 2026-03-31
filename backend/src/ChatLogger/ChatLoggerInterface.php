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
        string $error = null,
        bool $transcoded = false
    ): void;

    /**
     * @param string $sessionUuid
     * @param bool $includeErrors
     * @return array
     */
    public function history(string $sessionUuid, bool $includeErrors = false): array;
}
