"use client";
import { Navbar, Nav, Button } from "react-bootstrap";
import Image from "next/image";
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/16/solid";
import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/routes";
import { useState } from "react";
import { ConfirmModal } from "@components/layout/Modals";

function NavBar({ title, fixed }: { title?: string; fixed?: boolean }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const handleLogout = () => setShowConfirm(true);

  const confirmLogout = () => {
    setShowConfirm(false);
    // O cookie de sessão é httpOnly e não pode ser removido por JS; o logout é
    // feito no servidor (route handler /logout), que expira o cookie e
    // redireciona. Navegação real (não router.push) para a resposta com o
    // Set-Cookie ser aplicada e a app recarregar sem estado de sessão.
    window.location.href = ROUTES.logout;
  };
  const cancelLogout = () => setShowConfirm(false);

  return (
    <>
      <Navbar
        className="mx-4"
        fixed={fixed ? "top" : undefined}
        variant="dark"
        expand={true}
        style={{ height: "var(--navbar-height)" }}
      >
        <Navbar.Brand className="d-flex align-items-center">
          <Button variant="link" className="p-0">
            <Image
              src="logo-small.svg"
              width={40}
              height={50}
              alt="logo"
              onClick={() => router.push(ROUTES.home)}
            />
          </Button>
          <ChevronRightIcon
            width={40}
            height={40}
            className="text-primary ms-2"
          />
          <span className="fs-3 fw-semibold ms-2 text-primary">
            {title || "Factory"}
          </span>
        </Navbar.Brand>
        <Nav className="ms-auto align-items-center">
          <Button
            variant="link"
            className="p-0"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <ArrowLeftEndOnRectangleIcon
              width={40}
              height={40}
              className="text-primary"
            />
          </Button>
        </Nav>
      </Navbar>
      <ConfirmModal
        show={showConfirm}
        onHide={cancelLogout}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        body="Are you sure you want to logout?"
      />
    </>
  );
}

export default NavBar;
