import { toast } from 'sonner';

export interface VectorDocument {
  id: string;
  content: string;
  metadata: {
    title: string;
    wikiId: number;
    school: string;
    author?: string;
    createdAt: string;
    type: 'wiki' | 'wiki_chunk';
    chunkIndex?: number;
  };
  embedding?: number[];
}

export interface SearchResult {
  document: VectorDocument;
  score: number;
}

class VectorStore {
  private documents: VectorDocument[] = [];
  private readonly CHUNK_SIZE = 500; // Chunk size
  private readonly CHUNK_OVERLAP = 50; // Chunk overlap size
  private readonly MAX_RESULTS = 5; // Maximum search results
  private readonly STORAGE_KEY = 'campass_rag_vectors';
  private readonly VERSION_KEY = 'campass_rag_version';
  private readonly CURRENT_VERSION = 1;

  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Save vector data to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const data = {
        documents: this.documents,
        timestamp: Date.now(),
        version: this.CURRENT_VERSION,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION.toString());
      console.log(`Saved ${this.documents.length} documents to localStorage`);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  /**
   * Load vector data from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const savedVersion = localStorage.getItem(this.VERSION_KEY);
      const savedData = localStorage.getItem(this.STORAGE_KEY);

      if (savedData && savedVersion === this.CURRENT_VERSION.toString()) {
        const data = JSON.parse(savedData);
        if (data.documents && Array.isArray(data.documents)) {
          this.documents = data.documents;
          console.log(
            `Loaded ${this.documents.length} documents from localStorage`,
          );
        }
      } else {
        console.log('No valid localStorage data found or version mismatch');
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }

  /**
   * Clear localStorage data
   */
  private clearLocalStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.VERSION_KEY);
      console.log('Cleared localStorage data');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  /**
   * Function to chunk text by sentences (splitting by dots)
   */
  private chunkText(
    text: string,
    chunkSize: number = this.CHUNK_SIZE,
    overlap: number = this.CHUNK_OVERLAP,
  ): string[] {
    // First, split by sentences (dots)
    const sentences = text
      .split(/[.!?]\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => s + '.'); // Add dots back

    if (sentences.length === 0) {
      return [text];
    }

    // If we have very few sentences, return them as is
    if (sentences.length <= 3) {
      return [sentences.join(' ')];
    }

    const chunks: string[] = [];
    let currentChunk = '';
    let i = 0;

    while (i < sentences.length) {
      const sentence = sentences[i];

      // If adding this sentence would exceed chunk size, finalize current chunk
      if (
        currentChunk.length > 0 &&
        currentChunk.length + sentence.length > chunkSize
      ) {
        chunks.push(currentChunk.trim());

        // Start new chunk with overlap (previous sentence(s))
        const overlapSentences = currentChunk
          .split(/[.!?]\s+/)
          .slice(-Math.max(1, Math.floor(overlap / 100))) // Use overlap as sentence count
          .filter((s) => s.trim().length > 0)
          .map((s) => s.trim() + '.');

        currentChunk = overlapSentences.join(' ') + ' ';
      }

      currentChunk += sentence + ' ';
      i++;
    }

    // Add the final chunk
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text];
  }

  /**
   * Generate text embedding using Upstage API
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Check API key
      const apiKey = import.meta.env.VITE_UPSTAGE_API_KEY;
      if (!apiKey) {
        throw new Error('VITE_UPSTAGE_API_KEY is not configured');
      }

      // Check and limit text length
      const cleanText = text.replace(/\n/g, ' ').trim();
      if (cleanText.length === 0) {
        throw new Error('Empty text provided for embedding');
      }

      // Truncate text if too long (according to Upstage API limits)
      const maxLength = 8000; // Safe length limit
      const inputText =
        cleanText.length > maxLength
          ? cleanText.substring(0, maxLength) + '...'
          : cleanText;

      console.log(
        `Generating embedding for text (${inputText.length} chars):`,
        inputText.substring(0, 100) + '...',
      );

      const response = await fetch(
        'https://api.upstage.ai/v1/solar/embeddings',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'solar-embedding-1-large-query',
            input: inputText,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Embedding API error response:', errorText);
        throw new Error(
          `Embedding API error: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();

      if (!data.data || !data.data[0] || !data.data[0].embedding) {
        console.error('Invalid API response:', data);
        throw new Error('Invalid embedding response format');
      }

      console.log(
        `Successfully generated embedding with ${data.data[0].embedding.length} dimensions`,
      );
      return data.data[0].embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vector dimensions must match');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Add wiki document to vector store with chunk list structure
   */
  async addWikiDocument(
    wiki: {
      id: number;
      title: string;
      content: string;
      school: string;
      author?: { name: string; nickname: string };
      createdAt: string;
    },
    onProgress?: (current: number, total: number, status: string) => void,
  ): Promise<{ chunks: string[] }> {
    try {
      console.log(`Starting to process wiki: "${wiki.title}" (ID: ${wiki.id})`);
      onProgress?.(0, 1, `Processing wiki: ${wiki.title}`);

      // Input data validation
      if (!wiki.title || !wiki.content) {
        throw new Error('Wiki title and content are required');
      }

      // Remove existing wiki document
      this.documents = this.documents.filter(
        (doc) => doc.metadata.wikiId !== wiki.id,
      );

      // Split content into chunks by sentences (dots)
      const chunks = this.chunkText(wiki.content);
      console.log(
        `Wiki "${wiki.title}" divided into ${chunks.length} chunks by sentence separation`,
      );

      // Process chunks in batch
      const chunkDocuments: VectorDocument[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(
          `Processing chunk ${i + 1}/${chunks.length} for wiki "${wiki.title}"`,
        );
        onProgress?.(
          i,
          chunks.length,
          `Processing chunk ${i + 1}/${chunks.length}`,
        );

        try {
          // Include title context for better embedding
          const embeddingText = `Title: ${wiki.title}\n\nContent: ${chunk}`;
          const embedding = await this.generateEmbedding(embeddingText);

          const document: VectorDocument = {
            id: `wiki_${wiki.id}_chunk_${i}`,
            content: chunk,
            metadata: {
              title: wiki.title,
              wikiId: wiki.id,
              school: wiki.school,
              author: wiki.author?.name || wiki.author?.nickname,
              createdAt: wiki.createdAt,
              type: 'wiki_chunk',
              chunkIndex: i,
            },
            embedding,
          };

          chunkDocuments.push(document);
          console.log(
            `Successfully processed chunk ${i + 1} for wiki "${wiki.title}"`,
          );

          // Small delay to prevent API rate limiting
          if (i < chunks.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } catch (chunkError) {
          console.error(
            `Failed to process chunk ${i + 1} for wiki "${wiki.title}":`,
            chunkError,
          );
          throw chunkError;
        }
      }

      // Add all chunks to documents at once
      this.documents.push(...chunkDocuments);

      // Save to localStorage after successful processing
      this.saveToLocalStorage();
      onProgress?.(chunks.length, chunks.length, `Completed: ${wiki.title}`);

      console.log(
        `Successfully added wiki "${wiki.title}" with ${chunks.length} chunks to vector store`,
      );

      return { chunks };
    } catch (error) {
      console.error(`Failed to add wiki document "${wiki.title}":`, error);
      toast.error(
        `Failed to vectorize wiki "${wiki.title}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  } /**
   * Add multiple wiki documents in batch with improved processing
   */
  async addWikiDocuments(
    wikis: Array<{
      id: number;
      title: string;
      content: string;
      school: string;
      author?: { name: string; nickname: string };
      createdAt: string;
    }>,
    onProgress?: (current: number, total: number, status: string) => void,
  ): Promise<{ processedArticles: number; totalChunks: number }> {
    const errors: Array<{ title: string; error: string }> = [];
    let successCount = 0;
    let totalChunks = 0;
    const articleChunks: { [key: string]: string[] } = {};

    console.log(`Starting batch processing of ${wikis.length} wiki articles`);
    onProgress?.(0, wikis.length, 'Starting batch processing...');

    for (let i = 0; i < wikis.length; i++) {
      const wiki = wikis[i];
      console.log(
        `Processing article ${i + 1}/${wikis.length}: "${wiki.title}"`,
      );
      onProgress?.(i, wikis.length, `Processing article: ${wiki.title}`);

      try {
        const result = await this.addWikiDocument(
          wiki,
          (_, __, chunkStatus) => {
            // Report sub-progress within current wiki
            onProgress?.(i, wikis.length, `${wiki.title}: ${chunkStatus}`);
          },
        );

        // Store chunk information for this article
        articleChunks[wiki.title] = result.chunks;
        totalChunks += result.chunks.length;
        successCount++;

        console.log(
          `✓ Successfully processed article ${i + 1}/${wikis.length}: "${wiki.title}" (${result.chunks.length} chunks)`,
        );

        // Yield control to prevent UI blocking
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Wait to avoid API rate limiting (only if not the last document)
        if (i < wikis.length - 1) {
          console.log('Waiting 300ms before next article...');
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `✗ Failed to process article ${i + 1}/${wikis.length}: "${wiki.title}":`,
          error,
        );
        errors.push({ title: wiki.title, error: errorMessage });

        // Stop entire processing for critical errors (e.g., missing API key)
        if (errorMessage.includes('VITE_UPSTAGE_API_KEY')) {
          console.error('Critical error detected, stopping batch processing');
          break;
        }
      }
    }

    onProgress?.(wikis.length, wikis.length, 'Batch processing completed');
    console.log(
      `Batch processing completed: ${successCount}/${wikis.length} articles processed (${totalChunks} total chunks)`,
    );

    // Log chunk distribution
    Object.entries(articleChunks).forEach(([title, chunks]) => {
      console.log(`Article "${title}": ${chunks.length} chunks`);
    });

    if (errors.length > 0) {
      const errorTitles = errors.map((e) => e.title).join(', ');
      console.error('Failed articles:', errors);

      if (successCount === 0) {
        toast.error(
          'All wiki articles failed to process. Please check your API settings.',
        );
      } else {
        toast.error(
          `Some wiki articles failed to process (${errors.length}): ${errorTitles}`,
        );
        toast.success(
          `${successCount} articles successfully processed with ${totalChunks} total chunks`,
        );
      }
    } else {
      toast.success(
        `All ${successCount} articles successfully processed with ${totalChunks} total chunks`,
      );
    }

    return { processedArticles: successCount, totalChunks };
  }

  /**
   * Search for documents related to query
   */
  async searchSimilarDocuments(
    query: string,
    maxResults: number = this.MAX_RESULTS,
  ): Promise<SearchResult[]> {
    if (this.documents.length === 0) {
      return [];
    }

    try {
      const queryEmbedding = await this.generateEmbedding(query);

      const results: SearchResult[] = [];

      for (const document of this.documents) {
        if (document.embedding) {
          const score = this.cosineSimilarity(
            queryEmbedding,
            document.embedding,
          );
          results.push({ document, score });
        }
      }

      // Sort by similarity score and return top results
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults)
        .filter((result) => result.score > 0.3); // Minimum similarity threshold
    } catch (error) {
      console.error('Failed to search documents:', error);
      return [];
    }
  }

  /**
   * Search documents only from specific school
   */
  async searchBySchool(
    query: string,
    school: string,
    maxResults: number = this.MAX_RESULTS,
  ): Promise<SearchResult[]> {
    const allResults = await this.searchSimilarDocuments(
      query,
      this.documents.length,
    );

    return allResults
      .filter((result) => result.document.metadata.school === school)
      .slice(0, maxResults);
  }

  /**
   * Return number of wiki articles in vector store (not chunks)
   */
  getDocumentCount(): number {
    const uniqueWikiIds = new Set<number>();
    this.documents.forEach((doc) => {
      if (doc.metadata.type === 'wiki_chunk') {
        uniqueWikiIds.add(doc.metadata.wikiId);
      }
    });
    return uniqueWikiIds.size;
  }

  /**
   * Return number of chunks in vector store
   */
  getChunkCount(): number {
    return this.documents.length;
  }

  /**
   * Get chunk distribution by article
   */
  getChunkDistribution(): { [articleTitle: string]: number } {
    const distribution: { [articleTitle: string]: number } = {};
    this.documents.forEach((doc) => {
      if (doc.metadata.type === 'wiki_chunk') {
        distribution[doc.metadata.title] =
          (distribution[doc.metadata.title] || 0) + 1;
      }
    });
    return distribution;
  }

  /**
   * Remove specific wiki document
   */
  removeWikiDocument(wikiId: number): void {
    const initialCount = this.documents.length;
    this.documents = this.documents.filter(
      (doc) => doc.metadata.wikiId !== wikiId,
    );
    const removedCount = initialCount - this.documents.length;
    console.log(`Removed ${removedCount} chunks for wiki ${wikiId}`);

    // Save to localStorage after removal
    this.saveToLocalStorage();
  }

  /**
   * Initialize vector store
   */
  clearAll(): void {
    this.documents = [];
    this.clearLocalStorage();
    console.log('Vector store cleared');
  }

  /**
   * Return list of currently stored wiki IDs
   */
  getStoredWikiIds(): number[] {
    const wikiIds = new Set<number>();
    this.documents.forEach((doc) => {
      if (doc.metadata.type === 'wiki_chunk') {
        wikiIds.add(doc.metadata.wikiId);
      }
    });
    return Array.from(wikiIds);
  }
}

// Singleton instance
export const vectorStore = new VectorStore();
