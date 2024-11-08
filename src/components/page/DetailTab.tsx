'use client';

import {Switch} from "@/components/ui/switch";
import {useContext, useEffect, useRef, useState} from "react";
import {chordsMap} from "@/data/chordsMap";
import {commonConfigs, customConfigs} from "@/data/drawChordDiagram";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {
    Ellipsis, Eraser, Star, Trash2,
} from "lucide-react";
import {useRouter} from "next/navigation";
import {GetTabByIdResponse} from "@/openapi/model";
import {Content} from "@/components/model/tab";
import {SVGuitarChord} from "svguitar";
import {useDeleteTab} from "@/openapi/api/tab/tab";
import {Slide, toast} from "react-toastify";
import {TabContext} from "@/context/TabContext";
import DetailTab_TabInfo from "@/components/page_component/detailTab/DetailTab_TabInfo";
import DetailTab_TabComments from "@/components/page_component/detailTab/DetailTab_TabComments";
import UpdateCommentModal from "@/components/page_component/detailTab/comment/UpdateCommentModal";
import CreateChildCommentModal from "@/components/page_component/detailTab/comment/CreateChildCommentModal";

const DetailTab = ({tab}: { tab: GetTabByIdResponse }) => {

    const [showDiagram, setShowDiagram] = useState<boolean>(true);
    const router = useRouter();
    const tabContentRef = useRef<HTMLDivElement | null>(null);

    const {findAllTab} = useContext(TabContext);

    // 악보 삭제
    const {mutate: deleteTab} = useDeleteTab({
        mutation: {
            onSuccess: async () => {
                toast.dismiss();

                toast.success("성공적으로 악보가 삭제되었습니다.", {
                    position: "top-center",
                    autoClose: 2500,
                    transition: Slide,
                    className: "text-sm",
                    theme: "colored",
                });
                await findAllTab.refetch();
                router.push("/");
            },
            onError: (error) => {
                console.log(error)
                toast.error("관리자에게 문의하세요", {
                    position: "top-center",
                    autoClose: 2500,
                    transition: Slide,
                    className: "text-sm",
                    theme: "colored",
                });
            }
        }
    })

    const DeleteAlert = () => {

        const handleCancel = () => {
            toast.dismiss();
        }

        const handleDelete = () => {
            deleteTab({tabId: tab.id!});
        };

        return (
            <div className="flex flex-col space-y-0.5 px-3">
                <div>정말 악보를 삭제하시겠습니까?</div>
                <div className="flex justify-end items-center">
                    <Button type="button" variant="ghost" size="sm" className="text-xs w-fit h-fit px-2 py-1.5"
                            onClick={handleCancel}>취소</Button>
                    <Button type="button" variant="ghost" size="sm" className="text-xs w-fit h-fit px-2 py-1.5"
                            onClick={handleDelete}>삭제</Button>
                </div>
            </div>
        );
    };

    const onDeleteSubmit = () => {
        toast.info(<DeleteAlert/>, {
            position: "top-center",
            transition: Slide,
            className: "text-sm",
            theme: "colored",
            autoClose: false,
            closeButton: false
        },);
    }

    useEffect(() => {

        if (tabContentRef.current) {

            tabContentRef.current.innerHTML = "";

            // JSON 문자열을 객체로 변환
            const parsedTab = JSON.parse(tab.content!);

            const tabDiv = document.createElement('div');
            tabDiv.className = "flex flex-col py-[70px]";

            parsedTab.forEach((item: Content) => {
                const lineDiv = document.createElement('div');
                lineDiv.className = `flex flex-col items-center my-1 pt-20 mx-auto`;

                const syllableContainerDiv = document.createElement('div');
                syllableContainerDiv.className = "flex relative p-1";

                item.lineData.forEach((line) => {
                    const syllabelDiv = document.createElement('div');
                    syllabelDiv.className = "flex flex-col relative";

                    const diagram_chordDiv = document.createElement('div');
                    diagram_chordDiv.className = "flex flex-col items-center justify-center";

                    if (line.chord) {
                        // 코드 다이어그램 출력
                        const chordDiagramDiv = document.createElement('div');
                        const chordDiagram = new SVGuitarChord(chordDiagramDiv);
                        const chord = chordsMap[line.chord];
                        const customConfig = customConfigs[line.chord]; // 프렛 설정을 위한 커스텀 설정
                        chordDiagramDiv.className = `${showDiagram ? 'flex' : 'hidden'} ${customConfig ? 'w-[55px] h-[55px] ' : 'w-12 h-12'} items-center absolute mt-[-96px]`;

                        chordDiagram
                            .configure({
                                ...commonConfigs,
                                ...customConfig,
                            })
                            .chord(chord)
                            .draw()

                        // 프랫 위치 설정
                        const tuningText = chordDiagramDiv.querySelectorAll('text.tuning');
                        if (tuningText.length > 1) {

                            const currentX = parseFloat(tuningText[0].getAttribute('x') || '0');
                            const currentY = parseFloat(tuningText[0].getAttribute('y') || '0');

                            tuningText[0].setAttribute('x', (currentX - 177).toString()); // 왼쪽으로 이동
                            tuningText[0].setAttribute('y', (currentY + 50).toString());   // 아래로 이동
                        }
                        diagram_chordDiv.appendChild(chordDiagramDiv);


                        // 코드 출력
                        const chordDiv = document.createElement('div');
                        chordDiv.className = `absolute text-sm font-semibold text-primary/60 mt-[-23px] text-center
                                        ${line.chord?.length === 1 && `left-1 w-[10px]`}
                                        ${line.chord?.length === 2 && `left-0 w-[20px]`}
                                        ${line.chord?.length === 3 && `-left-[9px] w-[40px]`}
                                        ${line.chord?.length === 4 && `-left-[9px] w-[50px]`}
                                        ${line.chord?.length === 5 && `-left-[19px] w-[60px]`}
                                        ${line.chord?.length === 6 && `-left-[16px] w-[60px]`}
                    `;
                        chordDiv.textContent = line.chord;
                        diagram_chordDiv.appendChild(chordDiv);

                    }
                    syllabelDiv.appendChild(diagram_chordDiv);


                    // 음절 출력
                    const textDiv = document.createElement('div');
                    textDiv.className = "relative inline-block min-w-[16px] mx-0.5 text-center";
                    textDiv.innerHTML = line.text === ' ' ? '&nbsp;&nbsp;&nbsp;' : line.text;
                    syllabelDiv.appendChild(textDiv);

                    syllableContainerDiv.appendChild(syllabelDiv);
                });

                lineDiv.appendChild(syllableContainerDiv);

                // comment 출력
                const commentDiv = document.createElement('div');
                commentDiv.className = "font-semibold py-1";
                commentDiv.textContent = item.comment;
                lineDiv.appendChild(commentDiv);

                // tabDiv에 각 항목 추가
                tabDiv.appendChild(lineDiv);
            });

            tabContentRef.current.appendChild(tabDiv);
        }

    }, [tab, showDiagram]);

    return (
        <>
            <div className="px-3 py-10 mx-auto w-full xl:w-[70%] h-screen">
                <div className="space-y-2 border-b pb-2">
                    <div className="text-2xl sm:text-4xl font-bold tracking-wide">{tab.song}</div>
                    <div className="text-md sm:text-lg font-semibold tracking-wide text-primary/50">{tab.artist}</div>
                </div>

                <div className="flex justify-between py-2">
                    <div>
                        <div className="flex items-center space-x-2 tracking-wide text-sm">
                            <div>Capo</div>
                            <div>:</div>
                            <div>{tab.capo}</div>
                        </div>

                        <div className="flex items-center space-x-2 tracking-wide text-sm">
                            <div>Style</div>
                            <div>:</div>
                            <div>{tab.style}</div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="hidden sm:flex items-center border h-10 rounded-md px-3">
                            <label className="label cursor-pointer">
                                <div className="flex items-center space-x-2">
                                    <img id="offChord" src="/image/offChord.png" alt="chord_off" className="w-[22px]"/>
                                    <Switch checked={showDiagram} className="h-5 w-10"
                                            onClick={() => setShowDiagram(!showDiagram)}/>
                                    <img id="onChord" src="/image/onChord.png" alt="chord_on" className="w-[20px]"/>
                                </div>
                            </label>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10"><Ellipsis/></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="bottom" align="end" className="w-fit h-fit p-2">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Star/>
                                        <span className="text-[14px]">즐겨찾기 추가</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => router.push(`/edit/${tab.id}`)}>
                                        <Eraser/>
                                        <span className="text-[14px]">수정</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={onDeleteSubmit}
                                    >
                                        <Trash2/>
                                        <span className="text-[14px]">삭제</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* 악보 내용 */}
                <div ref={tabContentRef}/>

                {/* 악보 정보 */}
                <DetailTab_TabInfo tab={tab}/>

                {/* 댓글 */}
                <DetailTab_TabComments tabId={tab.id!}/>
            </div>

            <UpdateCommentModal/>
            <CreateChildCommentModal/>
        </>
    )
}

export default DetailTab;