
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-product-description.ts';
import '@/ai/flows/moderate-comment-flow.ts'; // Add the new flow
import '@/ai/flows/generate-product-description-flow.ts'; // Add new description generation flow
