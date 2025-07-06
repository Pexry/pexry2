import { DashboardNavbar } from "@/modules/dashboard/components/dashboard-navbar";
import { DashboardSidebarDesktop } from "@/modules/dashboard/components/dashboard-sidebar-desktop";
import { AgentRedirectWrapper } from "@/components/agent-redirect-wrapper";
import { DashboardAuthWrapper } from "@/components/dashboard-auth-wrapper";

interface Props {
    children: React.ReactNode;
}

const Layout = async ({children}: Props) => {

    return (
        <DashboardAuthWrapper>
            <div className="flex flex-col min-h-screen">
                {/* Fixed navbar */}
                <div className="fixed top-0 left-0 right-0 z-50">
                    <DashboardNavbar />
                </div>
                
                {/* Main content with sidebar */}
                <div className="flex pt-[72px]"> {/* pt-[72px] accounts for navbar height */}
                    {/* Fixed desktop sidebar */}
                    <div className="hidden lg:block fixed left-0 top-[72px] bottom-0 w-64 z-40">
                        <DashboardSidebarDesktop />
                    </div>
                    
                    {/* Main content area */}
                    <div className="flex-1 lg:ml-64 bg-[#F5F4F0] min-h-[calc(100vh-72px)]">
                        <AgentRedirectWrapper>
                            {children}
                        </AgentRedirectWrapper>
                    </div>
                </div>
            </div>
        </DashboardAuthWrapper>
    );
}

export default Layout;