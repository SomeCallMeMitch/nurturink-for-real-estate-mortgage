/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AcceptInvitation from './pages/AcceptInvitation';
import AdminCardDetails from './pages/AdminCardDetails';
import AdminCardLayout from './pages/AdminCardLayout';
import AdminClientEdit from './pages/AdminClientEdit';
import AdminClients from './pages/AdminClients';
import AdminCoupons from './pages/AdminCoupons';
import AdminCreateContentLayout from './pages/AdminCreateContentLayout';
import AdminEmailTesting from './pages/AdminEmailTesting';
import AdminEnvelopeLayout from './pages/AdminEnvelopeLayout';
import AdminPricing from './pages/AdminPricing';
import AdminRefunds from './pages/AdminRefunds';
import AdminSendDetails from './pages/AdminSendDetails';
import AdminSends from './pages/AdminSends';
import AdminTestEmails from './pages/AdminTestEmails';
import AdminUploadWhiteImage from './pages/AdminUploadWhiteImage';
import ApprovalQueue from './pages/ApprovalQueue';
import CampaignDetail from './pages/CampaignDetail';
import CampaignSetupWizard from './pages/CampaignSetupWizard';
import Campaigns from './pages/Campaigns';
import CreateContent from './pages/CreateContent';
import CreateContent2 from './pages/CreateContent2';
import Credits from './pages/Credits';
import Dashboard from './pages/Dashboard';
import EditQuickSendTemplate from './pages/EditQuickSendTemplate';
import EditTemplate from './pages/EditTemplate';
import FindClients from './pages/FindClients';
import Landing from './pages/Landing';
import LandingPremium from './pages/LandingPremium';
import Legal from './pages/Legal';
import MailingConfirmation from './pages/MailingConfirmation';
import MobileClientAdd from './pages/MobileClientAdd';
import MobileClientEdit from './pages/MobileClientEdit';
import MobileClients from './pages/MobileClients';
import MobileHome from './pages/MobileHome';
import MobileProfile from './pages/MobileProfile';
import MobileSend from './pages/MobileSend';
import MobileSendSuccess from './pages/MobileSendSuccess';
import Onboarding from './pages/Onboarding';
import Order from './pages/Order';
import PaymentCancel from './pages/PaymentCancel';
import PaymentSuccess from './pages/PaymentSuccess';
import PillDemo from './pages/PillDemo';
import QuickSendTemplates from './pages/QuickSendTemplates';
import ReviewAndSend from './pages/ReviewAndSend';
import ScribeTest from './pages/ScribeTest';
import SeedClone from './pages/SeedClone';
import SelectDesign from './pages/SelectDesign';
import SettingsAddresses from './pages/SettingsAddresses';
import SettingsOrganization from './pages/SettingsOrganization';
import SettingsPhones from './pages/SettingsPhones';
import SettingsProfile from './pages/SettingsProfile';
import SettingsUrls from './pages/SettingsUrls';
import SettingsWritingStyle from './pages/SettingsWritingStyle';
import SidebarDemo from './pages/SidebarDemo';
import Solar from './pages/Solar';
import SuperAdminCardManagement from './pages/SuperAdminCardManagement';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminWhitelabel from './pages/SuperAdminWhitelabel';
import TeamManagement from './pages/TeamManagement';
import TemplatePreview from './pages/TemplatePreview';
import Templates from './pages/Templates';
import TestEmail from './pages/TestEmail';
import UpdateUserRole from './pages/UpdateUserRole';
import WLDemo from './pages/WLDemo';
import Welcome from './pages/Welcome';
import WelcomeRoof from './pages/WelcomeRoof';
import landing1 from './pages/landing1';
import lp from './pages/lp';
import Roofing from './pages/Roofing';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AcceptInvitation": AcceptInvitation,
    "AdminCardDetails": AdminCardDetails,
    "AdminCardLayout": AdminCardLayout,
    "AdminClientEdit": AdminClientEdit,
    "AdminClients": AdminClients,
    "AdminCoupons": AdminCoupons,
    "AdminCreateContentLayout": AdminCreateContentLayout,
    "AdminEmailTesting": AdminEmailTesting,
    "AdminEnvelopeLayout": AdminEnvelopeLayout,
    "AdminPricing": AdminPricing,
    "AdminRefunds": AdminRefunds,
    "AdminSendDetails": AdminSendDetails,
    "AdminSends": AdminSends,
    "AdminTestEmails": AdminTestEmails,
    "AdminUploadWhiteImage": AdminUploadWhiteImage,
    "ApprovalQueue": ApprovalQueue,
    "CampaignDetail": CampaignDetail,
    "CampaignSetupWizard": CampaignSetupWizard,
    "Campaigns": Campaigns,
    "CreateContent": CreateContent,
    "CreateContent2": CreateContent2,
    "Credits": Credits,
    "Dashboard": Dashboard,
    "EditQuickSendTemplate": EditQuickSendTemplate,
    "EditTemplate": EditTemplate,
    "FindClients": FindClients,
    "Landing": Landing,
    "LandingPremium": LandingPremium,
    "Legal": Legal,
    "MailingConfirmation": MailingConfirmation,
    "MobileClientAdd": MobileClientAdd,
    "MobileClientEdit": MobileClientEdit,
    "MobileClients": MobileClients,
    "MobileHome": MobileHome,
    "MobileProfile": MobileProfile,
    "MobileSend": MobileSend,
    "MobileSendSuccess": MobileSendSuccess,
    "Onboarding": Onboarding,
    "Order": Order,
    "PaymentCancel": PaymentCancel,
    "PaymentSuccess": PaymentSuccess,
    "PillDemo": PillDemo,
    "QuickSendTemplates": QuickSendTemplates,
    "ReviewAndSend": ReviewAndSend,
    "ScribeTest": ScribeTest,
    "SeedClone": SeedClone,
    "SelectDesign": SelectDesign,
    "SettingsAddresses": SettingsAddresses,
    "SettingsOrganization": SettingsOrganization,
    "SettingsPhones": SettingsPhones,
    "SettingsProfile": SettingsProfile,
    "SettingsUrls": SettingsUrls,
    "SettingsWritingStyle": SettingsWritingStyle,
    "SidebarDemo": SidebarDemo,
    "Solar": Solar,
    "SuperAdminCardManagement": SuperAdminCardManagement,
    "SuperAdminDashboard": SuperAdminDashboard,
    "SuperAdminWhitelabel": SuperAdminWhitelabel,
    "TeamManagement": TeamManagement,
    "TemplatePreview": TemplatePreview,
    "Templates": Templates,
    "TestEmail": TestEmail,
    "UpdateUserRole": UpdateUserRole,
    "WLDemo": WLDemo,
    "Welcome": Welcome,
    "WelcomeRoof": WelcomeRoof,
    "landing1": landing1,
    "lp": lp,
    "Roofing": Roofing,
}

export const pagesConfig = {
    mainPage: "Welcome",
    Pages: PAGES,
    Layout: __Layout,
};