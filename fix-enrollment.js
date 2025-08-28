// Script to manually fix the enrollment for aggarwaldeepmala1006@gmail.com
// Run this in browser console or use it to call the edge function

const fixEnrollment = async () => {
  try {
    const response = await fetch('https://xujaxssbncobmiwxbaxh.supabase.co/functions/v1/manual-enrollment-fix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1amF4c3NibmNvYm1pd3hiYXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMzYxODcsImV4cCI6MjA3MDgxMjE4N30.OIGcn1R0Nb8noYAS1I9Mmo-8jUdEndOHY7xfkgk3WfY'
      },
      body: JSON.stringify({
        userEmail: 'aggarwaldeepmala1006@gmail.com',
        orderId: 'order_RAj1aLpQcTqhEE'
      })
    });

    const result = await response.json();
    console.log('Fix result:', result);
    return result;
  } catch (error) {
    console.error('Error fixing enrollment:', error);
    return { error: error.message };
  }
};

// Call the function
fixEnrollment();