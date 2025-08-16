import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

interface PricingSettings {
  usd_early_bird: number
  usd_regular: number
  usd_mrp: number
  inr_early_bird: number
  inr_regular: number
  inr_mrp: number
  early_bird_duration_hours: number
  is_early_bird_active: boolean
  early_bird_end_time: string | null
}

interface LocationPricing {
  currency: string
  earlyBird: number
  regular: number
  mrp: number
  symbol: string
}

export function usePricing() {
  const [pricingSettings, setPricingSettings] = useState<PricingSettings | null>(null)
  const [pricing, setPricing] = useState<LocationPricing>({
    currency: "USD",
    earlyBird: 129,
    regular: 149,
    mrp: 199,
    symbol: "$"
  })
  const [timeLeft, setTimeLeft] = useState(0)
  const [isEarlyBird, setIsEarlyBird] = useState(false)

  useEffect(() => {
    fetchPricingSettings()
    detectLocation()
  }, [])

  const fetchPricingSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_settings')
        .select('*')
        .single()

      if (error) throw error
      setPricingSettings(data)
      
      // Calculate time left for early bird
      if (data.is_early_bird_active && data.early_bird_end_time) {
        const endTime = new Date(data.early_bird_end_time).getTime()
        const now = new Date().getTime()
        const timeDiff = Math.max(0, Math.floor((endTime - now) / 1000))
        setTimeLeft(timeDiff)
        setIsEarlyBird(timeDiff > 0)
      } else {
        setIsEarlyBird(false)
        setTimeLeft(0)
      }
    } catch (error) {
      console.error('Error fetching pricing settings:', error)
    }
  }

  const detectLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      
      if (data.country_code === 'IN') {
        // Will be updated with actual pricing when pricingSettings loads
        setPricing(prev => ({
          ...prev,
          currency: "INR",
          symbol: "₹"
        }))
      }
    } catch (error) {
      console.log('Could not detect location, using default USD pricing')
    }
  }

  // Update pricing when settings change
  useEffect(() => {
    if (pricingSettings && pricing.currency) {
      if (pricing.currency === "INR") {
        setPricing(prev => ({
          ...prev,
          earlyBird: pricingSettings.inr_early_bird,
          regular: pricingSettings.inr_regular,
          mrp: pricingSettings.inr_mrp
        }))
      } else {
        setPricing(prev => ({
          ...prev,
          earlyBird: pricingSettings.usd_early_bird,
          regular: pricingSettings.usd_regular,
          mrp: pricingSettings.usd_mrp
        }))
      }
    }
  }, [pricingSettings, pricing.currency])

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsEarlyBird(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentPrice = isEarlyBird ? pricing.earlyBird : pricing.regular

  return {
    pricing,
    isEarlyBird,
    timeLeft,
    currentPrice,
    formatTime
  }
}