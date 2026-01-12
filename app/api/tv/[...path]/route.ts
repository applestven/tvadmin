import { NextRequest, NextResponse } from 'next/server'
import { proxyWithFallback } from '@/lib/proxy'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params
    const pathname = '/' + path.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    const fullPath = searchParams ? `${pathname}?${searchParams}` : pathname

    try {
        const { data } = await proxyWithFallback('tv', fullPath, 'GET')
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Request failed' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params
    const pathname = '/' + path.join('/')
    const body = await request.json().catch(() => undefined)

    try {
        const { data } = await proxyWithFallback('tv', pathname, 'POST', body)
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Request failed' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params
    const pathname = '/' + path.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    const fullPath = searchParams ? `${pathname}?${searchParams}` : pathname
    const body = await request.json().catch(() => undefined)

    try {
        const { data } = await proxyWithFallback('tv', fullPath, 'DELETE', body)
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Request failed' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params
    const pathname = '/' + path.join('/')
    const body = await request.json().catch(() => undefined)

    try {
        const { data } = await proxyWithFallback('tv', pathname, 'PUT', body)
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Request failed' },
            { status: 500 }
        )
    }
}
