import Home from './pages/Home';
import AdminCardLayout from './pages/AdminCardLayout';
import AdminEnvelopeLayout from './pages/AdminEnvelopeLayout';
import FindClients from './pages/FindClients';
import CreateContent from './pages/CreateContent';
import Templates from './pages/Templates';
import EditTemplate from './pages/EditTemplate';
import CreateContent2 from './pages/CreateContent2';
import AdminClients from './pages/AdminClients';
import AdminClientEdit from './pages/AdminClientEdit';
import SettingsWritingStyle from './pages/SettingsWritingStyle';
import SettingsProfile from './pages/SettingsProfile';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "AdminCardLayout": AdminCardLayout,
    "AdminEnvelopeLayout": AdminEnvelopeLayout,
    "FindClients": FindClients,
    "CreateContent": CreateContent,
    "Templates": Templates,
    "EditTemplate": EditTemplate,
    "CreateContent2": CreateContent2,
    "AdminClients": AdminClients,
    "AdminClientEdit": AdminClientEdit,
    "SettingsWritingStyle": SettingsWritingStyle,
    "SettingsProfile": SettingsProfile,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};