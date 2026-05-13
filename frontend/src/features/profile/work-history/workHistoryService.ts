import { workHistoryMockData } from './mockData'
import type { WorkHistoryPageData } from './types'

function cloneData(): WorkHistoryPageData {
  return JSON.parse(JSON.stringify(workHistoryMockData)) as WorkHistoryPageData
}

export async function getWorkHistoryPageData(): Promise<WorkHistoryPageData> {
  await new Promise((resolve) => window.setTimeout(resolve, 150))
  return cloneData()
}
