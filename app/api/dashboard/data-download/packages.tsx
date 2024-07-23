import { NextResponse } from 'next/server'

import { promises as fs } from 'fs'
import path from 'path'

export interface DataPackage {
    id: number,
    name: string,
    dataset: string,
    scenarios: string,
    models: string,
    vars: string,
    boundaryType: string,
    frequency: string,
    dataFormat: string,
    rangeStart: string,
    rangeEnd: string,
    units: string,
    disabled: boolean
}

export type PackagesData = DataPackage[]

export async function GET(): Promise<PackagesData> {
    const filePackages = await fs.readFile(process.cwd() + '/lib/data-download/packages.json', 'utf8')

    if (!filePackages) {
        throw new Error('Failed to fetch packages')
    }

    const packagesData = JSON.parse(filePackages)

    return packagesData
}