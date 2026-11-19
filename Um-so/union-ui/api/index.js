import {createSupabaseApplication} from '../server/supabase-app.mjs';

export default {fetch(request){return createSupabaseApplication().handle(request);}};
