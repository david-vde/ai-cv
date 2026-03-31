<?php

namespace App\File\DataExtractor;

use App\Model\AudioFile;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class UploadedFileDataExtractor
{
    public function extractDataFromUploadedFile(UploadedFile $uploadedFile): AudioFile
    {
        $movedFile = $uploadedFile->move(sys_get_temp_dir(), 'audio.' . ($uploadedFile->guessExtension() ?? 'webm'));

        return new AudioFile(
            $movedFile->getPathname(),
            $movedFile->getMimeType()
        );
    }
}
