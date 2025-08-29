import { NextRequest, NextResponse } from "next/server";
import {
    validateEnvironment,
    initializeAgent,
    runAutonomousMode,
    getOrCreateAgent,
} from "@/utils/service";

const getHandler = async (
    req: NextRequest,
    res: NextResponse
): Promise<NextResponse> => {
    validateEnvironment();
    const { agent, config } = await initializeAgent();

    // await runAutonomousMode(agent, config);
    const repo_agent = await getOrCreateAgent(
        "0xd7c29967803d25fd91677713e3c06051bbd76e6a93a78652bc5dd56a613654ea"
    );

    return NextResponse.json({
        message: "Hello from the GET handler!",
        agent: repo_agent,
    });
};

export { getHandler as GET };
