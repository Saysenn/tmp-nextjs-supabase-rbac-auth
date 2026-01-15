'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import {User} from '@supabase/supabase-js';
import {useState} from 'react';

type EmailPasswordDemoProps = {
    user: User | null;
}

type Mode = "signup" | "signin"

export default function EmailPasswordDemo({user}: EmailPasswordDemoProps){
    const [mode, setMode] = useState("signup");
    const supabase = getSupabaseBrowserClient();
    return (
        <div>
            <h1>Email Password Demo</h1>
            <p>Current user: {user ? user.email : 'Not logged in'}</p>
        </div>
    )
}