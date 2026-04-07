export interface ChatMessage {
    role: string;
    text: string;
}

export interface ChatMessages {
    messages: ChatMessage[];
}
