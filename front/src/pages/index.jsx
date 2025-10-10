import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Assistant from "./Assistant";

import Recharge from "./Recharge";

import Internet from "./Internet";

import Transfer from "./Transfer";

import Bills from "./Bills";

import TopUp from "./TopUp";

import Transactions from "./Transactions";

import Wallet from "./Wallet";

import P2PTransfer from "./P2PTransfer";

import Withdraw from "./Withdraw";

import Analysis from "./Analysis";

import Statistics from "./Statistics";

import Contacts from "./Contacts";

import Receipts from "./Receipts";

import Profile from "./Profile";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {

    Dashboard: Dashboard,

    Assistant: Assistant,

    Recharge: Recharge,

    Internet: Internet,

    Transfer: Transfer,

    Bills: Bills,

    TopUp: TopUp,

    Transactions: Transactions,

    Wallet: Wallet,

    P2PTransfer: P2PTransfer,

    Withdraw: Withdraw,

    Analysis: Analysis,

    Statistics: Statistics,

    Contacts: Contacts,

    Receipts: Receipts,

    Profile: Profile,

}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    return (
        <Layout currentPageName={currentPage}>
            <Routes>

                <Route path="/" element={<Dashboard />} />

                <Route path="/Dashboard" element={<Dashboard />} />

                <Route path="/Assistant" element={<Assistant />} />

                <Route path="/Recharge" element={<Recharge />} />

                <Route path="/Internet" element={<Internet />} />

                <Route path="/Transfer" element={<Transfer />} />

                <Route path="/Bills" element={<Bills />} />

                <Route path="/TopUp" element={<TopUp />} />

                <Route path="/Transactions" element={<Transactions />} />

                <Route path="/Wallet" element={<Wallet />} />

                <Route path="/P2PTransfer" element={<P2PTransfer />} />

                <Route path="/Withdraw" element={<Withdraw />} />

                <Route path="/Analysis" element={<Analysis />} />

                <Route path="/Statistics" element={<Statistics />} />

                <Route path="/Contacts" element={<Contacts />} />

                <Route path="/Receipts" element={<Receipts />} />

                <Route path="/Profile" element={<Profile />} />

            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}