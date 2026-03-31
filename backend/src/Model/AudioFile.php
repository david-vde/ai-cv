<?php

namespace App\Model;

readonly class AudioFile
{
    public function __construct(public string $fileName, public string $mimeType)
    {
    }
}
