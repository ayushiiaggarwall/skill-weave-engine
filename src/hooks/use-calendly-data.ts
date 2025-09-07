import { useState, useEffect } from 'react'

interface CalendlyData {
  isScheduled: boolean
  assignedTo?: string
  eventTypeUuid?: string
  eventTypeName?: string
  eventStartTime?: string
  eventEndTime?: string
  inviteeUuid?: string
  inviteeFirstName?: string
  inviteeLastName?: string
  inviteeFullName?: string
  inviteeEmail?: string
  textReminderNumber?: string
  answers?: {
    answer1?: string
    answer2?: string
    answer3?: string
  }
}

export function useCalendlyData(): CalendlyData {
  const [calendlyData, setCalendlyData] = useState<CalendlyData>({
    isScheduled: false
  })

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    
    const eventStartTime = urlParams.get('event_start_time')
    const eventEndTime = urlParams.get('event_end_time')
    
    if (eventStartTime && eventEndTime) {
      setCalendlyData({
        isScheduled: true,
        assignedTo: urlParams.get('assigned_to') || undefined,
        eventTypeUuid: urlParams.get('event_type_uuid') || undefined,
        eventTypeName: urlParams.get('event_type_name') || undefined,
        eventStartTime,
        eventEndTime,
        inviteeUuid: urlParams.get('invitee_uuid') || undefined,
        inviteeFirstName: urlParams.get('invitee_first_name') || undefined,
        inviteeLastName: urlParams.get('invitee_last_name') || undefined,
        inviteeFullName: urlParams.get('invitee_full_name') || undefined,
        inviteeEmail: urlParams.get('invitee_email') || undefined,
        textReminderNumber: urlParams.get('text_reminder_number') || undefined,
        answers: {
          answer1: urlParams.get('answer_1') || undefined,
          answer2: urlParams.get('answer_2') || undefined,
          answer3: urlParams.get('answer_3') || undefined,
        }
      })
    }
  }, [])

  return calendlyData
}