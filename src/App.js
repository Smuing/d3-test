import { useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import * as d3 from "d3";
import { gsap } from "gsap";
import keywordList from "./temp-data/keywordList";
import profileImg from "./temp-data/profile.png";
import debounce from "./utils/debounce";

const CirclesBoard = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
`;

const App = () => {
  const [clientSize, setClientSize] = useState({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  });
  const svgRef = useRef(null);

  const handleResize = debounce(() => {
    setClientSize({
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    });
  }, 100);
  useLayoutEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useLayoutEffect(() => {
    const nodes = [
      { r: 70, x: 0, y: 0, profile: true, name: "나성민" },
      ...keywordList.map(i => {
        return {
          r: i.num > 20 ? 160 : i.num > 10 ? 120 : 80,
          keyword: i.keyword,
          num: i.num,
          color: i.color,
        };
      }),
    ];
    console.log(nodes);

    const svg = d3.select(svgRef.current);

    const simulation = d3
      .forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(1))
      .force("center", d3.forceCenter(clientSize.width / 2, clientSize.height / 2))
      .force(
        "collision",
        d3.forceCollide().radius(d => d.r + 40)
      );

    const circles = svg.selectAll("a").data(nodes).join("a").attr("xlink:href", "#");
    circles
      .append("circle")
      .attr("r", d => d.r)
      .attr("fill", d => d.color)
      .attr("stroke", "#F3E99F")
      .attr("stroke-width", 2)
      .attr("stroke-position", "inside")
      .classed("profile", d => d.profile)
      .classed("keyword-circle", true);

    circles
      .append("svg:image")
      .attr("href", d => (d.profile ? profileImg : ""))
      .attr("height", d => d.r * 2)
      .attr("width", d => d.r * 2)
      .attr("x", d => -d.r)
      .attr("y", d => -d.r)
      .attr("clip-path", d => `url(#circle-clip-${d.r})`);

    circles
      .append("text")
      .attr("dy", d => (d.profile ? "100px" : "0"))
      .style("text-anchor", "middle")
      .text(d => (d.profile ? d.name : d.keyword))
      .attr("font-size", d => (d.profile ? "20px" : "30px"))
      .attr("fill", "#3C486B");

    circles
      .append("text")
      .attr("dy", "2em")
      .style("text-anchor", "middle")
      .text(d => d.num)
      .attr("font-size", "20px")
      .attr("fill", "#3C486B");

    const defs = svg.append("defs");
    defs
      .append("clipPath")
      .attr("id", `circle-clip-${nodes[0].r}`)
      .append("circle")
      .attr("r", nodes[0].r)
      .attr("cx", 0)
      .attr("cy", 0);

    simulation.on("tick", () => {
      circles.attr("transform", d =>
        d.profile
          ? `translate(${clientSize.width / 2},${clientSize.height / 2})`
          : `translate(${d.x},${d.y})`
      );
    });

    let animation;

    svg.on("mousemove", e => {
      if (animation) {
        animation.kill();
      }

      const mouseX = e.offsetX;
      const mouseY = e.offsetY;

      if (mouseX === 0 && mouseY === 0) {
        return;
      }

      const newViewBoxX = mouseX - clientSize.width / 2;
      const newViewBoxY = mouseY - clientSize.height / 2;

      animation = gsap.to(svgRef.current, {
        duration: 0.4,
        attr: {
          viewBox: `${newViewBoxX} ${newViewBoxY} ${clientSize.width} ${clientSize.height}`,
        },
      });
    });
    svg.on("mouseleave", () => {
      if (animation) {
        animation.kill();
      }

      animation = gsap.to(svgRef.current, {
        duration: 0.4,
        attr: { viewBox: `0 0 ${clientSize.width} ${clientSize.height}` },
      });
    });

    return () => {
      circles.remove();
      defs.remove();
    };
  }, [clientSize]);

  return (
    <CirclesBoard
      viewBox={`0 0 ${clientSize.width} ${clientSize.height}`}
      width={clientSize.width}
      height={clientSize.height}
      ref={svgRef}>
      <rect
        x={-(clientSize.width / 2)}
        y={-(clientSize.height / 2)}
        width={clientSize.width * 2}
        height={clientSize.height * 2}
        fill="transparent"
        style={{ cursor: "copy" }}
        onClick={() => {
          console.log(1);
        }}></rect>
    </CirclesBoard>
  );
};

export default App;
