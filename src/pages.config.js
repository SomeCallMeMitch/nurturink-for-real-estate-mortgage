import Home from './pages/Home';
import AdminCardLayout from './pages/AdminCardLayout';
import AdminEnvelopeLayout from './pages/AdminEnvelopeLayout';
import FindClients from './pages/FindClients';
import CreateContent from './pages/CreateContent';
import Templates from './pages/Templates';
import EditTemplate from './pages/EditTemplate';
import AdminClients from './pages/AdminClients';
import AdminClientEdit from './pages/AdminClientEdit';
import SettingsWritingStyle from './pages/SettingsWritingStyle';
import SettingsProfile from './pages/SettingsProfile';
import SettingsAddresses from './pages/SettingsAddresses';
import SettingsPhones from './pages/SettingsPhones';
import SettingsUrls from './pages/SettingsUrls';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminCreateContentLayout from './pages/AdminCreateContentLayout';
import SettingsOrganization from './pages/SettingsOrganization';
import TemplatePreview from './pages/TemplatePreview';
import SuperAdminCardManagement from './pages/SuperAdminCardManagement';
import SelectDesign from './pages/SelectDesign';
import ReviewAndSend from './pages/ReviewAndSend';
import MailingConfirmation from './pages/MailingConfirmation';
import AdminPricing from './pages/AdminPricing';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "AdminCardLayout": AdminCardLayout,
    "AdminEnvelopeLayout": AdminEnvelopeLayout,
    "FindClients": FindClients,
    "CreateContent": CreateContent,
    "Templates": Templates,
    "EditTemplate": EditTemplate,
    "AdminClients": AdminClients,
    "AdminClientEdit": AdminClientEdit,
    "SettingsWritingStyle": SettingsWritingStyle,
    "SettingsProfile": SettingsProfile,
    "SettingsAddresses": SettingsAddresses,
    "SettingsPhones": SettingsPhones,
    "SettingsUrls": SettingsUrls,
    "SuperAdminDashboard": SuperAdminDashboard,
    "AdminCreateContentLayout": AdminCreateContentLayout,
    "SettingsOrganization": SettingsOrganization,
    "TemplatePreview": TemplatePreview,
    "SuperAdminCardManagement": SuperAdminCardManagement,
    "SelectDesign": SelectDesign,
    "ReviewAndSend": ReviewAndSend,
    "MailingConfirmation": MailingConfirmation,
    "AdminPricing": AdminPricing,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};