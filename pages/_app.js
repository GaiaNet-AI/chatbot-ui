import {Toaster} from 'react-hot-toast';
import {QueryClient, QueryClientProvider} from 'react-query';
import {appWithTranslation} from 'next-i18next';
import 'tippy.js/dist/tippy.css';

import '@/styles/globals.css';

function App({Component, pageProps}) {
    const queryClient = new QueryClient();

    return (
        <div>
            <Toaster/>
            <QueryClientProvider client={queryClient}>
                <Component {...pageProps} />
            </QueryClientProvider>
        </div>
    );
}

export default appWithTranslation(App);
