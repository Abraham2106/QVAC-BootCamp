import { useProgress } from './useProgress'

/** @deprecated Prefer useProgress(classId, { itemCount }) */
export function useProgressWithFeedback(classId, totalItems) {
  return useProgress(classId, { itemCount: totalItems })
}
