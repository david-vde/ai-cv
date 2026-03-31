<?php

namespace App\Transcriber;

use App\Model\AudioFile;

interface AudioTranscriberInterface
{
    public function transcribe(AudioFile $audio): string;
}
