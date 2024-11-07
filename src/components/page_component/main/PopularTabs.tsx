import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {faker} from "@faker-js/faker";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink, PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import {useRouter} from "next/navigation";
import {SearchTabsResponse} from "@/openapi/model";
import {formatDate} from "@/utils/formatDate";

const PopularTabs = ({tabs}: { tabs: SearchTabsResponse[] }) => {

    const router = useRouter();

    const handleDetailTab = (tabId: number) => {
        router.push("/tab/" + tabId);
    }

    function generateSheetMusicData(count: number) {
        return Array.from({length: count}).map((_, index) => ({
            no: index + 1,
            tabId: index + 1,
            artist: faker.music.songName(),
            song: faker.lorem.words(3),
            writer: faker.name.fullName(),
            createAt: faker.date.past().toLocaleDateString(),
            // updateAt: faker.date.past().toLocaleDateString(),
            updateAt: ""
        }));
    }

    const popularTabs = generateSheetMusicData(10); // 예시로 10개의 데이터를 생성

    return (
        <div className="space-y-10">
            <Table>
                <TableHeader>
                    <TableRow className="cursor-default hover:bg-transparent">
                        <TableHead className="text-center">no</TableHead>
                        <TableHead className="text-center">Artist</TableHead>
                        <TableHead className="text-center">Song</TableHead>
                        <TableHead className="text-center">악보제작자</TableHead>
                        <TableHead className="text-center">등록일</TableHead>
                        <TableHead className="text-center">수정일</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tabs.map((popularTab, index) => {
                        return (
                            <TableRow key={index} className="cursor-pointer"
                                      onClick={() => handleDetailTab(popularTab.id!)}>
                                <TableCell className="text-center">{index + 1}</TableCell>
                                <TableCell className="text-center">{popularTab.artist}</TableCell>
                                <TableCell className="text-center">{popularTab.song}</TableCell>
                                <TableCell className="text-center">미구현</TableCell>
                                <TableCell className="text-center">{formatDate(popularTab.createdAt!)}</TableCell>
                                <TableCell
                                    className="text-center">{popularTab.updatedAt !== "" ? formatDate(popularTab.updatedAt!) : "-"}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#"/>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationEllipsis/>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext href="#"/>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}

export default PopularTabs;