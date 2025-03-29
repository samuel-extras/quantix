import Mira from "/public/mira.png";
import MiraWhite from "/public/mira-white.png";
import { NavLink } from "react-router";
export default function LogoRender() {
    return (
        <>
            <NavLink
                to="/"
                className="flex flex-row dark:hidden gap-1 items-center font-bold text-black "
            >
                <img
                    src={Mira}
                    alt="Mira ai"
                    width={36}
                    height={36}
                    className=""
                />
                Quantix
            </NavLink>
            <NavLink
                to="/"
                className="hidden flex-row dark:flex gap-1 items-center font-bold text-lg"
            >
                <img
                    src={MiraWhite}
                    alt="Mira ai"
                    width={36}
                    height={36}
                    className=""
                />
                Quantix
            </NavLink>
        </>
    );
}
