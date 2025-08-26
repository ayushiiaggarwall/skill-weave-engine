import { useCoursePricing } from "./use-course-pricing"

// Legacy hook - now redirects to course-based pricing
export function usePricing() {
  return useCoursePricing() // Use the first active course
}