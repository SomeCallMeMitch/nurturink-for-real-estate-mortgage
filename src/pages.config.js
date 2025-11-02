import Home from './pages/Home';
import AdminCardLayout from './pages/AdminCardLayout';
import AdminEnvelopeLayout from './pages/AdminEnvelopeLayout';
import FindClients from './pages/FindClients';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "AdminCardLayout": AdminCardLayout,
    "AdminEnvelopeLayout": AdminEnvelopeLayout,
    "FindClients": FindClients,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};