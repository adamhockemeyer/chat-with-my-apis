'use server';


interface ApiResponse {
    api_id: string;
    name: string;
    description: string | null;
}

export interface ProductResponse {
    product_id: string;
    name: string;
}

export async function fetchApisByProductId(productId: string): Promise<ApiResponse[]> {
    try {
        const baseUrl = process.env.SK_API_ENDPOINT ?? 'http://127.0.0.1:8000';

        const response = await fetch(`${baseUrl}/v1/apis/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Error fetching APIs for product ID ${productId}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching APIs for product ID ${productId}:`, error);
        throw error;
    }
};

export async function fetchAgentProducts(): Promise<ProductResponse[]> {
    try {
        const baseUrl = process.env.SK_API_ENDPOINT ?? 'http://127.0.0.1:8000';
        const genericChatProductId = process.env.GENERIC_CHAT_APIM_PRODUCT_ID;

        const response = await fetch(`${baseUrl}/v1/agent-products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Error fetching agent products: ${response.statusText}`);
        }
        const products: ProductResponse[] = await response.json();
        //return products.filter(product => product.product_id !== genericChatProductId);
        return products;
    } catch (error) {
        console.error(`Error fetching agent products:`, error);
        throw error;
    }
};
