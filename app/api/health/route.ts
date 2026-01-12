import { NextRequest, NextResponse } from 'next/server'
import { checkHealth } from '@/lib/proxy'

export async function GET() {
    const health = {
        tv: {
            public: await checkHealth('tv', 'public'),
            private: await checkHealth('tv', 'private'),
        },
        dv: {
            public: await checkHealth('dv', 'public'),
            private: await checkHealth('dv', 'private'),
        },
    }

    return NextResponse.json(health)
}
