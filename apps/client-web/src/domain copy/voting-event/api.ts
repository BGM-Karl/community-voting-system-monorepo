import { votingEventContract } from "@community-voting-system/shared";
import { useClient } from "../../common/api";
import { VotingEvent } from "../../domain/voting-event/type";

const fakeData: VotingEvent['response']['find'] = {
  total: 5,
  skip: 0,
  limit: 5,
  data: [
    {
      id: '1',
      title: '社區綠化計劃',
      description: '選擇您喜歡的綠化方案',
      status: '進行中',
      requiredParticipationRate: 0.5,
      requiredWeightRate: 0.5,
      maxSelectableOptions: 2,
      totalHouseholds: 10,
      totalWeight: 100,
      options: [
        { id: 'A', content: '增加更多樹木' },
        { id: 'B', content: '設置花園' },
        { id: 'C', content: '建立社區菜園' },
        { id: 'D', content: '安裝綠色牆面' }
      ],
      result: {

        participatingHouseholds: 8,
        participatingWeight: 80,
        optionResults: [
          { optionId: 'A', content: '增加更多樹木', votes: 5, weight: 44 },
          { optionId: 'B', content: '設置花園', votes: 6, weight: 52 },
          { optionId: 'C', content: '建立社區菜園', votes: 3, weight: 28 },
          { optionId: 'D', content: '安裝綠色牆面', votes: 2, weight: 16 }
        ]
      },
      timestamp: {
        createdAt: '2024-09-01T00:00:00Z',
        startAt: '2024-10-05T00:00:00Z',
        endAt: '2024-10-20T23:59:59Z',
        updatedAt: '2024-10-21T00:00:00Z'
      }
    },
    {
      id: '2',
      title: '社區安全措施評估',
      description: '評估現有安全措施的效果',
      status: '進行中',
      requiredParticipationRate: 0.5,
      requiredWeightRate: 0.5,
      maxSelectableOptions: 3,
      totalHouseholds: 10,
      totalWeight: 100,
      options: [
        { id: 'A', content: '增加監控攝像頭' },
        { id: 'B', content: '改善照明系統' },
        { id: 'C', content: '增加保安巡邏次數' },
        { id: 'D', content: '安裝智能門禁系統' }
      ],
      result: {

        participatingHouseholds: 7,
        participatingWeight: 72,
        optionResults: [
          { optionId: 'A', content: '增加監控攝像頭', votes: 4, weight: 36 },
          { optionId: 'B', content: '改善照明系統', votes: 5, weight: 44 },
          { optionId: 'C', content: '增加保安巡邏次數', votes: 3, weight: 28 },
          { optionId: 'D', content: '安裝智能門禁系統', votes: 2, weight: 20 }
        ]
      },
      timestamp: {
        createdAt: '2024-09-15T00:00:00Z',
        startAt: '2024-10-01T00:00:00Z',
        endAt: '2024-10-15T23:59:59Z',
        updatedAt: '2024-10-16T00:00:00Z'
      }
    },
    {
      id: '3',
      title: '未來社區活動計劃',
      description: '選擇您最感興趣的社區活動',
      status: '未開始',
      requiredParticipationRate: 0.5,
      requiredWeightRate: 0.5,
      maxSelectableOptions: 2,
      totalHouseholds: 10,
      totalWeight: 100,
      options: [
        { id: 'A', content: '社區運動會' },
        { id: 'B', content: '藝術展覽' },
        { id: 'C', content: '美食節' },
        { id: 'D', content: '讀書會' }
      ],
      result: {

        participatingHouseholds: 0,
        participatingWeight: 0,
        optionResults: []
      },
      timestamp: {
        createdAt: '2024-11-01T00:00:00Z',
        startAt: '2024-12-01T00:00:00Z',
        endAt: '2024-12-07T23:59:59Z',
        updatedAt: '2024-12-03T00:00:00Z'
      }
    },
    {
      id: '4',
      title: '社區公共空間使用規則',
      description: '制定新的公共空間使用規則',
      status: '已結束',
      requiredParticipationRate: 0.6,
      requiredWeightRate: 0.5,
      maxSelectableOptions: 2,
      totalHouseholds: 10,
      totalWeight: 100,
      options: [
        { id: 'A', content: '延長開放時間' },
        { id: 'B', content: '增加清潔頻率' },
        { id: 'C', content: '設立預約系統' },
        { id: 'D', content: '增加使用限制' }
      ],
      result: {
        participatingHouseholds: 5,
        participatingWeight: 52,
        optionResults: [
          { optionId: 'A', content: '延長開放時間', votes: 3, weight: 28 },
          { optionId: 'B', content: '增加清潔頻率', votes: 4, weight: 36 },
          { optionId: 'C', content: '設立預約系統', votes: 2, weight: 20 },
          { optionId: 'D', content: '增加使用限制', votes: 1, weight: 12 }
        ]
      },
      timestamp: {
        createdAt: '2024-09-10T00:00:00Z',
        startAt: '2024-09-20T00:00:00Z',
        endAt: '2024-10-05T23:59:59Z',
        updatedAt: '2024-10-06T00:00:00Z'
      }
    },
    {
      id: '5',
      title: '社區節日慶祝活動',
      description: '選擇您喜歡的節日慶祝方式',
      status: '已結束',
      requiredParticipationRate: 0.5,
      requiredWeightRate: 0.5,
      maxSelectableOptions: 2,
      totalHouseholds: 10,
      totalWeight: 100,
      options: [
        { id: 'A', content: '大型戶外派對' },
        { id: 'B', content: '文化表演晚會' },
        { id: 'C', content: '家庭烤肉活動' },
        { id: 'D', content: '社區遊戲競賽' }
      ],
      result: {

        participatingHouseholds: 9,
        participatingWeight: 92,
        optionResults: [
          { optionId: 'A', content: '大型戶外派對', votes: 6, weight: 56 },
          { optionId: 'B', content: '文化表演晚會', votes: 5, weight: 48 },
          { optionId: 'C', content: '家庭烤肉活動', votes: 4, weight: 40 },
          { optionId: 'D', content: '社區遊戲競賽', votes: 3, weight: 32 }
        ]
      },
      timestamp: {
        createdAt: '2024-09-15T00:00:00Z',
        startAt: '2024-09-25T00:00:00Z',
        endAt: '2024-10-10T23:59:59Z',
        updatedAt: '2024-10-11T00:00:00Z'
      }
    }
  ]
}

const votingEventClient = useClient(votingEventContract)

export async function getVotingEvents(query: VotingEvent['request']['find'] = {}): Promise<VotingEvent['response']['find']> {
  // await new Promise(resolve => setTimeout(resolve, 1000));
  // return fakeData;
  const result = await votingEventClient.find({ query });
  if (result.status === 200) {
    return result.body
  }
  throw new Error('Failed to fetch voting events');
}

export async function getVotingEvent(id: string): Promise<VotingEvent['response']['findOne'] | undefined> {
  const result = await votingEventClient.findOne({ params: { id } });
  if (result.status === 200) {
    return result.body
  }
  return undefined;
}
