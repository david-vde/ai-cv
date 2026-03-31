<?php

namespace App\Controller;

use App\File\DataExtractor\UploadedFileDataExtractor;
use App\Transcriber\AudioTranscriberInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;

#[AsController]
readonly class TranscribeController
{
    public function __construct(
        private UploadedFileDataExtractor $uploadedFileDataExtractor,
        private AudioTranscriberInterface $audioTranscriber)
    {
    }

    #[Route('/api/audio-transcribe', name: 'api_audio_transcribe', methods: ['POST'])]
    public function audioTranscribe(Request $request): JsonResponse
    {
        $audioFile = $request->files->get('files') ?? $request->files->get('file');

        if (!$audioFile instanceof UploadedFile) {
            $allFiles = $request->files->all();
            if (!empty($allFiles)) {
                $audioFile = current($allFiles);
            }
        }

        if (!$audioFile instanceof UploadedFile || $audioFile->getError() !== UPLOAD_ERR_OK) {
            $errorCode = $audioFile instanceof UploadedFile ? $audioFile->getError() : 'no_file';
            return new JsonResponse(['error' => 'Missing or invalid audio file. Code: ' . $errorCode], 400);
        }

        try {
            $audioModel = $this->uploadedFileDataExtractor->extractDataFromUploadedFile($audioFile);

            return new JsonResponse([
                'transcription' => $this->audioTranscriber->transcribe($audioModel)
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Unable to transcribe audio: ' . $e->getMessage()
            ], 500);
        }
    }
}
