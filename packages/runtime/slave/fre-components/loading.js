export function Loading(props) {
    const Loading = fre.styled("section")`
            width: 20px;
            height: 20px;
            animation: loading 1s steps(60, end) infinite;
            position: relative;
            display: inline-flex;
            color: var(--primary-border-color);
            &:before {
              content: "";
              display: block;
              width: 10px;
              height: 20px;
              box-sizing: border-box;
              border: 2px solid;
              border-right-width: 0;
              border-top-left-radius: 16px;
              border-bottom-left-radius: 16px;
              -webkit-mask-image: -webkit-linear-gradient(
                top,
                #000000 8%,
                rgba(0, 0, 0, 0.3) 95%
              );
            }
            &:after {
              content: "";
              display: block;
              width: 10px;
              height: 20px;
              box-sizing: border-box;
              border: 2px solid;
              border-left-width: 0;
              border-top-right-radius: 16px;
              border-bottom-right-radius: 16px;
              -webkit-mask-image: -webkit-linear-gradient(
                225deg,
                rgba(0, 0, 0, 0) 45%,
                rgba(0, 0, 0, 0.3) 95%
              );
            }
            @keyframes loading {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `
    return fre.h(Loading, props)

}