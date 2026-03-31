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
        file_put_contents('/tmp/debug.log', "Ma variable : " . print_r($request->getContent(), true), FILE_APPEND);
        error_log("--- DEBUG AUDIO START ---");
        error_log("FILES reçus : " . print_r($_FILES, true));
        error_log("POST reçus : " . print_r($_POST, true));
        $audioFile = $request->files->get('files');

        if (!$audioFile instanceof UploadedFile) {
            $audioFile = $request->files->get('file');
        }

        if (!$audioFile instanceof UploadedFile) {
            return new JsonResponse(['error' => 'Missing audio file.'], 400);
        }

        if (!$audioFile instanceof UploadedFile && $request->files->all()) {
            $allFiles = $request->files->all();
            $audioFile = reset($allFiles);
        }

        try {
            $audioModel = $this->uploadedFileDataExtractor->extractDataFromUploadedFile($audioFile);
            return new JsonResponse([
                'transcription' => $this->audioTranscriber->transcribe($audioModel)
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(json_encode([
                'error' => 'Unable to transcribe audio. ' . $e->getMessage()
            ]), 500, [], true);
        }
    }
}
