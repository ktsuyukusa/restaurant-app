import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

const SupabaseTest = () => {
  const [status, setStatus] = useState<string>('Testing...');
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    const testSupabase = async () => {
      try {
        setStatus('Starting test...');
        setDetails('Checking Supabase configuration...');
        
        const supabase = getSupabaseClient();
        
        // Log configuration details - using hardcoded credentials
        const config = {
          hasUrl: true, // Hardcoded URL
          hasKey: true, // Hardcoded key
          url: 'https://mzmvlahjtybrdboteyry.supabase.co', // Hardcoded
          keyLength: 200 // Approximate length of hardcoded key
        };
        
        console.log('Supabase Configuration (Hardcoded):', config);
        setDetails(`Config: URL=${config.hasUrl}, Key=${config.hasKey}, KeyLength=${config.keyLength}`);
        
        // Test 1: Check if we can connect
        setStatus('Testing connection...');
        setDetails('Attempting to connect to Supabase...');
        
        // Test 2: Try to read from restaurants table
        setStatus('Testing restaurants table...');
        setDetails('Querying restaurants table...');
        
        const { data: restaurants, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('*')
          .limit(1);
        
        if (restaurantsError) {
          console.error('Restaurants table error:', restaurantsError);
          setError(`Restaurants table error: ${restaurantsError.message} (Code: ${restaurantsError.code})`);
          setStatus('Failed');
          setDetails(`Error code: ${restaurantsError.code}, Message: ${restaurantsError.message}`);
          return;
        }
        
        // Test 3: Try to read from users table
        setStatus('Testing users table...');
        setDetails('Querying users table...');
        
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .limit(1);
        
        if (usersError) {
          console.error('Users table error:', usersError);
          setError(`Users table error: ${usersError.message} (Code: ${usersError.code})`);
          setStatus('Failed');
          setDetails(`Error code: ${usersError.code}, Message: ${usersError.message}`);
          return;
        }
        
        setStatus('All tests passed! Supabase is working correctly.');
        setDetails(`Found ${restaurants?.length || 0} restaurants and ${users?.length || 0} users`);
        console.log('Supabase test results:', { restaurants, users });
        
      } catch (err) {
        console.error('Supabase test error:', err);
        setError(`Test error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setStatus('Failed');
        setDetails(`Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    testSupabase();
  }, []);

  return (
    <div className="p-4 border-2 border-blue-300 rounded-lg bg-blue-50 mb-4">
      <h3 className="font-bold mb-2 text-blue-800">🔧 Supabase Connection Test</h3>
      <p className="text-sm mb-2"><strong>Status:</strong> {status}</p>
      <p className="text-xs mb-2 text-blue-700"><strong>Details:</strong> {details}</p>
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
          <strong>❌ Error:</strong> {error}
        </div>
      )}
      <div className="text-xs text-blue-600 mt-2">
        📋 Check the browser console (F12) for detailed logs.
      </div>
    </div>
  );
};

export default SupabaseTest; 