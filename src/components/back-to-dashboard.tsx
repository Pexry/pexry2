import { Button, Link } from "@payloadcms/ui"

export const BackToDashboard = () => {
    return (
        <Link href="/dashboard/products">
            <Button>
                Back to Dashboard
            </Button>
        </Link>
    );
};