import { Agentkit, AgentkitToolkit } from "@0xgasless/agentkit";
import { HumanMessage } from "@langchain/core/messages";
import { StructuredTool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
// import * as readline from "readline";

const agentInstances = new Map();

function validateEnvironment(): void {
    const missingVars: string[] = [];

    const {
        NEXT_PUBLIC_PRIVATE_KEY,
        NEXT_PUBLIC_API_KEY,
        NEXT_PUBLIC_OPENAI_API_KEY,
        NEXT_PUBLIC_OPENROUTER_API_KEY,
        NEXT_PUBLIC_RPC_URL,
        NEXT_PUBLIC_CHAIN_ID,
    } = process.env;

    Object.entries({
        NEXT_PUBLIC_PRIVATE_KEY,
        NEXT_PUBLIC_API_KEY,
        NEXT_PUBLIC_OPENAI_API_KEY,
        NEXT_PUBLIC_OPENROUTER_API_KEY,
        NEXT_PUBLIC_RPC_URL,
        NEXT_PUBLIC_CHAIN_ID,
    }).forEach(([key, value]) => {
        if (!value) {
            missingVars.push(key);
        }
    });

    if (missingVars.length > 0) {
        console.error("Error: Required environment variables are not set");
        missingVars.forEach((varName) => {
            console.error(`${varName}=your_${varName.toLowerCase()}_here`);
        });
        process.exit(1);
    }

    if (!process.env.NEXT_PUBLIC_CHAIN_ID) {
        console.warn("Warning: CHAIN_ID not set, defaulting to base-sepolia");
    }
}

async function initializeAgent() {
    try {
        const llm = new ChatOpenAI({
            model: "gpt-oss-20b",
            apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
            configuration: {
                baseURL: "https://openrouter.ai/api/v1",
            },
        });

        const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY as string;

        // Initialize 0xGasless AgentKit
        const agentkit = await Agentkit.configureWithWallet({
            privateKey: PRIVATE_KEY as `0x${string}`,
            rpcUrl: process.env.NEXT_PUBLIC_RPC_URL as string,
            apiKey: process.env.NEXT_PUBLIC_API_KEY as string,
            chainID: 43113, // fuji
        });

        // Initialize AgentKit Toolkit and get tools
        const agentkitToolkit = new AgentkitToolkit(agentkit);
        const tools = agentkitToolkit.getTools();

        console.log("tools:", tools);

        const memory = new MemorySaver();
        const agentConfig = {
            configurable: { thread_id: "0xGasless AgentKit Chatbot Example!" },
        };

        const agent = createReactAgent({
            llm,
            tools,
            checkpointSaver: memory,
            messageModifier: `
        You are a helpful agent that can interact with EVM chains using 0xGasless smart accounts. You can perform 
        gasless transactions using the account abstraction wallet. You can check balances of ETH and any ERC20 token 
        by providing their contract address. If someone asks you to do something you can't do with your currently 
        available tools, you must say so. Be concise and helpful with your responses.
      `,
        });

        return { agent, config: agentConfig };
    } catch (error) {
        console.error("Failed to initialize agent:", error);
        throw error;
    }
}

// For runAutonomousMode, runChatMode, chooseMode and main functions, reference:

/**
 * Run the agent autonomously with specified intervals
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 * @param interval - Time interval between actions in seconds
 */

//biome-ignore lint/suspicious/noExplicitAny: <explanation>
async function runAutonomousMode(agent: any, config: any, interval = 10) {
    console.log("Starting autonomous mode...");

    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const thought =
                "Be creative and do something interesting on the blockchain. " +
                "Choose an action or set of actions and execute it that highlights your abilities.";

            console.log(thought);

            const stream = await agent.stream(
                { messages: [new HumanMessage(thought)] },
                config
            );

            console.log(stream);

            for await (const chunk of stream) {
                if ("agent" in chunk) {
                    console.log(chunk.agent.messages[0].content);
                } else if ("tools" in chunk) {
                    console.log(chunk.tools.messages[0].content);
                }
                console.log("-------------------");
            }

            await new Promise((resolve) =>
                setTimeout(resolve, interval * 1000)
            );
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error:", error.message);
            }
            process.exit(1);
        }
    }
}

async function createAgentInstance(privateKey: `0x${string}`) {
    try {
        const llm = new ChatOpenAI({
            model: "openai/gpt-4o",
            openAIApiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
            configuration: {
                baseURL: "https://openrouter.ai/api/v1",
            },
        });

        // Configure agent with wallet entirely server-side
        const agentkit = await Agentkit.configureWithWallet({
            privateKey,
            rpcUrl: process.env.NEXT_PUBLIC_RPC_URL as string,
            apiKey: process.env.NEXT_PUBLIC_API_KEY as string,
            chainID: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 56,
        });

        const toolkit = new AgentkitToolkit(agentkit);
        const tools = toolkit.getTools();
        const memory = new MemorySaver();
        const config = {
            configurable: { thread_id: "0xGasless AgentKit Chat" },
        };

        const agent = createReactAgent({
            llm,
            tools: tools as StructuredTool[],
            checkpointSaver: memory,
            messageModifier: `You are a smart account built by 0xGasless Smart SDK operating exclusively on Binance Smart Chain (BSC). You are capable of gasless blockchain interactions on BSC. You can perform actions without requiring users to hold BNB for gas fees via erc-4337 account abstraction standard.

Capabilities on BSC:
- Check balances of BNB and any BEP20 tokens by symbol or address
- Transfer tokens gaslessly on BSC
- Perform token swaps without gas fees on BSC
- Create and deploy new smart accounts on BSC

Important Information:
- The wallet is already configured with the SDK for BSC operations. DO NOT generate or mention private keys when using any tools.
- You are operating ONLY on Binance Smart Chain (BSC, Chain ID: 56)
- All transactions are gasless - users don't need BNB for gas fees
- Default RPC uses Ankr's free tier which has rate limitations

Token Information for BSC (Chain ID: 56):
- USDC: 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d
- USDT: 0x55d398326f99059fF775485246999027B3197955
- WETH: 0x4DB5a66E937A9F4473fA95b1cAF1d1E1D62E29EA

When checking token balances on BSC:
1. For USDC balance: ALWAYS use 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d
2. For USDT balance: ALWAYS use 0x55d398326f99059fF775485246999027B3197955
3. For WETH balance: ALWAYS use 0x4DB5a66E937A9F4473fA95b1cAF1d1E1D62E29EA
4. Never mix up these addresses or use alternative addresses
5. When asked about a specific token, use ONLY that token's address
6. Double check the balance result matches the token being queried

When interacting with tokens on BSC:
1. ALWAYS use these exact contract addresses:
   - For USDC: 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d
   - For USDT: 0x55d398326f99059fF775485246999027B3197955
   - For WETH: 0x4DB5a66E937A9F4473fA95b1cAF1d1E1D62E29EA
2. Always verify token addresses are valid BEP20 tokens
3. Check token balances before transfers
4. Use proper decimal precision for token amounts

You can assist users by:
1. Getting wallet balances on BSC - when asked about balances:
   - Use ONLY the exact address for the specific token being queried
   - For USDC queries, use ONLY 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d
   - For USDT queries, use ONLY 0x55d398326f99059fF775485246999027B3197955
   - For WETH queries, use ONLY 0x4DB5a66E937A9F4473fA95b1cAF1d1E1D62E29EA
   - Never mix up these addresses when checking balances
2. Executing token transfers using the exact addresses on BSC
3. Performing token swaps using the exact addresses on BSC
4. Creating new smart accounts on BSC
5. Checking transaction status on BSC
6. Performing debridge swaps from/to BSC

For token swaps on BSC:
1. Use the exact token addresses provided above
2. Don't try to resolve symbols - use the predefined addresses directly
3. Always specify the exact contract addresses in your swap calls
4. Remember all operations are on Binance Smart Chain
5. When performing a swap, provide specific amounts (e.g. "Swap 1 USDT to USDC")

Please ensure all addresses and token amounts are properly validated before executing transactions on BSC.

For transaction tracking on BSC:
1. Always include the user operation hash in your responses when transactions are submitted
2. Explain what this hash represents and how users can track their transaction
3. Clarify that with gasless transactions, first a user operation hash is created, then it becomes a transaction
4. Format transaction/operation hashes in a way that's easy to copy

Be concise and helpful in your responses. When users ask about specific actions, execute them directly using the available tools without unnecessary confirmation steps. Always use the exact token addresses provided above for BSC operations. Remember you are operating exclusively on Binance Smart Chain (BSC).

IMPORTANT: When checking token balances:
- If someone asks "What is my USDC balance?" - use ONLY 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d
- If someone asks "What is my USDT balance?" - use ONLY 0x55d398326f99059fF775485246999027B3197955
- If someone asks "What is my WETH balance?" - use ONLY 0x4DB5a66E937A9F4473fA95b1cAF1d1E1D62E29EA
Never mix up these addresses when checking balances.`,
        });

        return { agent, config };
    } catch (error) {
        console.error("Failed to create agent instance:", error);

        // Return a minimal mock agent that won't try to use crypto
        return {
            agent: {
                stream: async () => {
                    // Simple generator that just returns a single message
                    return {
                        async *[Symbol.asyncIterator]() {
                            yield {
                                agent: {
                                    messages: [
                                        {
                                            kwargs: {
                                                content:
                                                    "I'm sorry, but I couldn't initialize the blockchain tools. This could be due to network issues or configuration problems.",
                                            },
                                        },
                                    ],
                                },
                            };
                        },
                    };
                },
            },
            config: { configurable: { thread_id: "fallback-agent" } },
        };
    }
}

async function getOrCreateAgent(privateKey: `0x${string}`) {
    // Check if we already have an instance
    if (agentInstances.has(privateKey)) {
        return agentInstances.get(privateKey);
    }

    // Create new agent instance
    const instance = await createAgentInstance(privateKey);
    agentInstances.set(privateKey, instance);
    return instance;
}

export {
    validateEnvironment,
    initializeAgent,
    runAutonomousMode,
    getOrCreateAgent,
};
