export const config = {
    // Match all paths for Basic Auth
    matcher: '/(.*)',
};

export default function middleware(request) {
    const basicAuth = request.headers.get('authorization');

    // Get credentials from Vercel Environment Variables
    const user = process.env.BASIC_AUTH_USER;
    const pwd = process.env.BASIC_AUTH_PASSWORD;

    // Apply Basic Auth only if environment variables are set
    if (user && pwd) {
        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1];
            const decodedValue = atob(authValue);
            const [providedUser, providedPwd] = decodedValue.split(':');

            if (providedUser === user && providedPwd === pwd) {
                return; // Return nothing to continue the request on Vercel Edge
            }
        }

        // Require authentication
        return new Response('Auth required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Area"',
            },
        });
    }

    // If environment variables are empty, pass through
    return;
}
