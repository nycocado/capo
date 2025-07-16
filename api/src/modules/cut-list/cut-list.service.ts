import { Injectable } from "@nestjs/common";
import { CutListRepository } from "@modules/cut-list/cut-list.repository";
import { CutListEntity } from "@modules/cut-list/entities";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { PipeLengthEntity } from "@modules/pipe-length/entities";
import { PartType, WorkStatusType } from "@database/entities";

@Injectable()
export class CutListService {
  constructor(
    private readonly cutListRepository: CutListRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getById(id: number): Promise<CutListEntity> {
    return this.cutListRepository.findFullByIdOrFail(id);
  }

  async getToDo(): Promise<CutListEntity[]> {
    const lists = await this.cutListRepository.findFullAll();
    return lists.filter((cutList) => {
      const statuses = cutList.workStatuses.getItems();
      const lastStatus = statuses[statuses.length - 1];
      return lastStatus.workStatusType.name !== WorkStatusType.FINISHED;
    });
  }

  async updateWorkStatusToWorking(
    cutList: CutListEntity,
    userId: number,
  ): Promise<CutListEntity> {
    const workStatus = cutList.workStatuses[cutList.workStatuses.length - 1];

    if (
      workStatus.workStatusType.name === WorkStatusType.WORKING ||
      workStatus.workStatusType.name === WorkStatusType.FINISHED
    ) {
      return this.cutListRepository.populateToFull(cutList);
    }

    const newCutList = await this.cutListRepository.updateWorkStatusToWorking(
      cutList,
      userId,
    );

    const populatedCutList =
      await this.cutListRepository.populateToFull(newCutList);

    this.eventEmitter.emit(
      "cut-list.updateWorkStatusToWorking",
      populatedCutList,
      userId,
    );

    return populatedCutList;
  }

  async updateWorkStatusToFinished(
    cutList: CutListEntity,
    userId: number,
  ): Promise<CutListEntity> {
    const newCutList = await this.cutListRepository.updateWorkStatusToFinished(
      cutList,
      userId,
    );

    const populatedCutList =
      await this.cutListRepository.populateToFull(newCutList);

    this.eventEmitter.emit(
      "cut-list.updateWorkStatusToFinished",
      populatedCutList,
      userId,
    );

    return populatedCutList;
  }

  @OnEvent("pipe-length.updateWorkStatusToFinished", { async: true })
  async handleWorkStatusToFinished(
    pipeLength: PipeLengthEntity,
    userId: number,
  ): Promise<CutListEntity> {
    const cutList =
      await this.cutListRepository.findMinimalByPipeLengthIdOrFail(
        pipeLength.part.id,
      );
    const workStatus = cutList.workStatuses[cutList.workStatuses.length - 1];

    if (
      (await this.isCutListFinished(cutList)) &&
      workStatus.workStatusType.name !== WorkStatusType.FINISHED
    ) {
      return this.updateWorkStatusToFinished(cutList, userId);
    }

    return this.cutListRepository.populateToFull(cutList);
  }

  async isCutListFinished(cutList: CutListEntity): Promise<boolean> {
    cutList = await this.cutListRepository.populateToFull(cutList);

    const sheets = cutList.isometric.sheets.getItems();
    for (const sheet of sheets) {
      const revisions = sheet.revisions.getItems();
      if (!revisions.length) continue;
      const lastRev = revisions[revisions.length - 1];
      for (const spool of lastRev.spools.getItems()) {
        for (const joint of spool.joints.getItems()) {
          for (const part of [joint.part1, joint.part2]) {
            if (part.type === PartType.PIPE_LENGTH) {
              const statuses = part.workStatuses.getItems();
              if (statuses.length === 0) {
                return false;
              }
              const lastStatus = statuses[statuses.length - 1];
              if (lastStatus.workStatusType.name !== WorkStatusType.FINISHED) {
                return false;
              }
            }
          }
        }
      }
    }
    return true;
  }
}
