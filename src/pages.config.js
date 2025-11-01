import Home from './pages/Home';
import AdminCardLayout from './pages/AdminCardLayout';
import AdminEnvelopeLayout from './pages/AdminEnvelopeLayout';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "AdminCardLayout": AdminCardLayout,
    "AdminEnvelopeLayout": AdminEnvelopeLayout,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};