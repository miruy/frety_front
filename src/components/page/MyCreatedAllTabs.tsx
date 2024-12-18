'use client';

import {Heart} from "lucide-react";
import * as React from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Pagination from "@/components/page_component/common/Pagination";
import {useQuery} from "@tanstack/react-query";
import {searchMyCreatedTabs} from "@/openapi/api/tab/tab";
import {useRouter} from "next/navigation";
import {useState} from "react";
import Loading from "@/app/loading";
import NotFound from "@/app/not-found";

const MyCreatedAllTabs = ({userName}: { userName: string }) => {

    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 상태

    const {
        data: myCreatedTabs,
        isLoading: isLoadingSearch,
        isError: isErrorSearch,
    } = useQuery({
        queryKey: ['MyCreatedAllTabs', currentPage, userName], // 쿼리 키
        queryFn: () => searchMyCreatedTabs(userName!, {page: currentPage, pageSize: 10}),
    });

    const handleDetailTab = (tabId: number) => {
        router.push("/tab/" + tabId);
    }

    if (isLoadingSearch) {
        return <Loading/>
    }
    if (isErrorSearch) {
        return <NotFound/>
    }

    return (
        <div className="px-3 py-10 mx-auto w-full lg:w-[70%] space-y-10">
            <div className="space-y-2 border-b pb-2">
                <div className="text-2xl sm:text-4xl font-bold tracking-wide">{userName}님이 제작한 악보</div>
                <div
                    className="text-md sm:text-lg font-semibold tracking-wide text-primary/50">{myCreatedTabs?.data?.length}개의
                    악보
                </div>
            </div>

            <div className="space-y-10">
                <Table>
                    <TableHeader>
                        <TableRow className="cursor-default hover:bg-transparent">
                            <TableHead className="text-center">Artist</TableHead>
                            <TableHead className="text-center">Song</TableHead>
                            <div className="flex flex-1 items-center">
                                <TableHead
                                    className="hidden md:flex flex-1 justify-center items-center text-center">
                                    <Heart className="w-4"/>
                                </TableHead>
                            </div>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {myCreatedTabs?.data?.map((myCreatedTab, index) => {
                            return (
                                <TableRow key={index} className="cursor-pointer"
                                          onClick={() => handleDetailTab(myCreatedTab.id!)}>
                                    <TableCell className="text-center">{myCreatedTab.artist}</TableCell>
                                    <TableCell className="text-center">{myCreatedTab.song}</TableCell>
                                    <div className="flex flex-1 items-center">
                                        <TableCell
                                            className="hidden md:flex flex-1 justify-center items-center text-center">{myCreatedTab.voteCount}</TableCell>
                                    </div>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>

                <div>
                    <Pagination
                        totalPage={myCreatedTabs?.meta?.totalPage || 1}
                        setCurrentPage={setCurrentPage}
                        currentPage={currentPage}
                        buttonSize={5}
                        hasPreviousPage={myCreatedTabs?.meta?.hasPreviousPage}
                        hasNextPage={myCreatedTabs?.meta?.hasNextPage}
                    />
                </div>
            </div>
        </div>
    )
}

export default MyCreatedAllTabs;