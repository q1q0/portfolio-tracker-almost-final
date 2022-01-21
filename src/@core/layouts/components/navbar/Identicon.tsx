import { useEffect, useRef } from "react";
import { useEthers } from "@usedapp/core";
import styled from "@emotion/styled";
import Jazzicon from "@metamask/jazzicon";

const StyledIdenticon = styled.div`
  border-radius: 1.125rem;
`;

export default function Identicon() {
    const ref = useRef<HTMLDivElement>();
    const { account } = useEthers();

    useEffect(() => {
        if (account && ref.current) {
            ref.current.innerHTML = "";
            ref.current.appendChild(Jazzicon(32, parseInt(account.slice(2, 10), 32)));
        }
    }, [account]);

    return <StyledIdenticon ref={ref as any} />
}
