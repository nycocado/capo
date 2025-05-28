import { Navbar, Nav, Button } from "react-bootstrap";
import Image from 'next/image'
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/16/solid";
import { UserIcon } from "@heroicons/react/16/solid";
import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/routes";

function NavBarNotFixed({ title }: { title?: string }) {
    const router = useRouter();

    return (
        <Navbar className="mx-4" variant="dark" expand="lg">
            <Navbar.Brand className="d-flex align-items-center">
                <Button variant="link" className="p-0">
                    <Image src="logo-small.svg" width={40} height={50} alt="logo"
                        onClick={() => router.push(ROUTES.home)} />
                </Button>
                <ChevronRightIcon width={40} height={40} className="text-primary ms-2" />
                <span className="fs-3 fw-semibold ms-2 text-primary">{title || 'Factory'}</span>
            </Navbar.Brand>
            <Nav className="ms-auto align-items-center gap-4">
                <Button variant="link" className="p-0 ms-3">
                    <UserIcon width={40} height={40} className="text-primary" />
                </Button>
                <Button variant="link" className="p-0">
                    <ArrowLeftEndOnRectangleIcon width={40} height={40} className="text-primary" />
                </Button>
            </Nav>
        </Navbar>
    )
}

export default NavBarNotFixed;

